const Order = require("../models/Order");
const Product = require("../models/Product");
const crypto = require("node:crypto");
const { sendEmail } = require("../utils/sendEmail");
const { userOrderEmail } = require("../emails/userOrderEmail");
const { adminOrderEmail } = require("../emails/adminOrderEmail");
const { reviewInviteEmail } = require("../emails/reviewInviteEmail");
const { createReviewToken } = require("../utils/reviewToken");
const {
  NON_CANCELLED_STATUSES,
  SALES_STATUSES,
  calculateOrderTotal,
  serializeOrder
} = require("../utils/orderTotals");
const { calculateDeliveryFee } = require("../config/delivery");
const { parsePhone } = require("../utils/moroccanPhone");

const MAX_ORDER_ITEMS = 50;
const MAX_ITEM_QUANTITY = 100;

/**
 * Short customer-facing reference, e.g. `NZ-6QK4-8H2D`.
 *
 * Random rather than sequential: a guessable counter would leak how many
 * orders the shop has taken. Collisions are caught by the unique sparse index
 * on `orderNumber`, and the ObjectId remains the real primary key.
 * Excludes I, O, 0 and 1, which are misread when spelled out over the phone.
 */
const ORDER_NUMBER_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const generateOrderNumber = () => {
  const pick = () => Array.from(crypto.randomBytes(4))
    .map((byte) => ORDER_NUMBER_ALPHABET[byte % ORDER_NUMBER_ALPHABET.length])
    .join("");
  return `NZ-${pick()}-${pick()}`;
};
const ORDER_PRODUCT_FIELDS = [
  "name slug sale_price stockStatus inStock",
  "colors._id colors.name colors.value colors.sku colors.price colors.stock colors.active colors.images.url",
  "colors.lensOptions._id colors.lensOptions.name colors.lensOptions.type colors.lensOptions.category",
  "colors.lensOptions.sku colors.lensOptions.price colors.lensOptions.stock colors.lensOptions.active colors.lensOptions.images.url"
].join(" ");
const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

class OrderInputValidationError extends Error {}

const STATUS_TRANSITIONS = Object.freeze({
  pending: new Set(["processing", "cancelled"]),
  processing: new Set(["shipped", "cancelled"]),
  shipped: new Set(["delivered"]),
  delivered: new Set(),
  cancelled: new Set()
});

const isPlainObject = (value) => Boolean(value && typeof value === "object" && !Array.isArray(value));
const isObjectId = (value) => typeof value === "string" && OBJECT_ID_PATTERN.test(value);

const readRequiredString = (value, name, maximum) => {
  if (typeof value !== "string") {
    throw new OrderInputValidationError(`${name} must be a string`);
  }
  const normalized = value.trim();
  if (!normalized || normalized.length > maximum) {
    throw new OrderInputValidationError(`${name} must contain between 1 and ${maximum} characters`);
  }
  return normalized;
};

const readQuantity = (value, index) => {
  if (
    (typeof value !== "number" && typeof value !== "string") ||
    (typeof value === "string" && !/^[1-9]\d*$/.test(value.trim()))
  ) {
    throw new OrderInputValidationError(`products[${index}].quantity must be an integer between 1 and ${MAX_ITEM_QUANTITY}`);
  }
  const quantity = Number(value);
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > MAX_ITEM_QUANTITY) {
    throw new OrderInputValidationError(`products[${index}].quantity must be an integer between 1 and ${MAX_ITEM_QUANTITY}`);
  }
  return quantity;
};

const readOptionalString = (value, name, maximum) => {
  if (value === undefined || value === null || value === "") return null;
  return readRequiredString(value, name, maximum);
};

const parseIdempotencyKey = (value) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") throw new OrderInputValidationError("Idempotency-Key must be a string");
  const key = value.trim();
  if (key.length < 16 || key.length > 128 || !/^[A-Za-z0-9._:-]+$/.test(key)) {
    throw new OrderInputValidationError("Idempotency-Key must contain 16 to 128 URL-safe characters");
  }
  return crypto.createHash("sha256").update(key).digest("hex");
};

const validateOrderRequest = (body) => {
  if (!isPlainObject(body)) throw new OrderInputValidationError("Request body must be an object");
  if (!Array.isArray(body.products) || !body.products.length) {
    throw new OrderInputValidationError("No products provided");
  }
  if (body.products.length > MAX_ORDER_ITEMS) {
    throw new OrderInputValidationError(`An order cannot contain more than ${MAX_ORDER_ITEMS} products`);
  }
  if (!isPlainObject(body.customer)) {
    throw new OrderInputValidationError("customer must be an object");
  }

  const products = body.products.map((item, index) => {
    if (!isPlainObject(item)) throw new OrderInputValidationError(`products[${index}] must be an object`);
    const product = readRequiredString(item.product, `products[${index}].product`, 24);
    if (!isObjectId(product)) throw new OrderInputValidationError(`products[${index}].product must be a valid product id`);
    const lensOption = readOptionalString(
      item.lensOption ?? item.lensOptionId,
      `products[${index}].lensOption`,
      100
    );
    if (item.lensOption !== undefined && item.lensOptionId !== undefined && normalizeComparable(item.lensOption) !== normalizeComparable(item.lensOptionId)) {
      throw new OrderInputValidationError(`products[${index}] contains conflicting lens option identifiers`);
    }
    return {
      product,
      quantity: readQuantity(item.quantity, index),
      color: readRequiredString(item.color, `products[${index}].color`, 100),
      lensOption
    };
  });

  // Phone is canonicalised to E.164 here so every downstream consumer — the
  // courier export, the admin search, a future WhatsApp follow-up — sees one
  // format regardless of how the customer typed it.
  const phone = parsePhone(readRequiredString(body.customer.phone, "customer.phone", 50));
  if (!phone) {
    throw new OrderInputValidationError("customer.phone must be a valid Moroccan or international phone number");
  }

  // Email is optional: cash on delivery is settled by phone, and demanding an
  // address the customer may not have is friction that costs orders.
  const email = readOptionalString(body.customer.email, "customer.email", 254)?.toLowerCase() ?? null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new OrderInputValidationError("customer.email must be a valid email address");
  }

  const customer = {
    fullName: readRequiredString(body.customer.fullName, "customer.fullName", 150),
    email,
    phone,
    adresse: readRequiredString(body.customer.adresse, "customer.adresse", 500),
    city: readRequiredString(body.customer.city, "customer.city", 120)
  };

  return { products, customer };
};

const normalizeComparable = (value) => String(value ?? "").trim().toLocaleLowerCase("en");

const findColorVariant = (product, requestedColor) => {
  const normalizedColor = normalizeComparable(requestedColor);
  return (Array.isArray(product.colors) ? product.colors : []).find((variant) => (
    normalizeComparable(variant?._id) === normalizedColor ||
    normalizeComparable(variant?.name) === normalizedColor ||
    normalizeComparable(variant?.value) === normalizedColor
  ));
};

const findLensOption = (colorVariant, requestedLens) => {
  const normalizedLens = normalizeComparable(requestedLens);
  if (!normalizedLens) return null;
  return (Array.isArray(colorVariant?.lensOptions) ? colorVariant.lensOptions : []).find((option) => (
    normalizeComparable(option?._id) === normalizedLens
    || normalizeComparable(option?.name) === normalizedLens
    || normalizeComparable(option?.type) === normalizedLens
    || normalizeComparable(option?.sku) === normalizedLens
  ));
};

const finitePrice = (...values) => {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0) {
      return Number(value);
    }
  }
  return null;
};

const finiteStock = (...values) => {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== '' && Number.isSafeInteger(Number(value)) && Number(value) >= 0) {
      return Number(value);
    }
  }
  return null;
};

const buildValidatedOrderSelection = (requestedItems, products) => {
  const productsById = new Map(products.map((product) => [String(product._id), product]));
  const reservations = [];
  const orderItems = requestedItems.map((item, index) => {
    const product = productsById.get(item.product);
    if (!product) throw new OrderInputValidationError(`products[${index}] is unavailable`);
    if (product.stockStatus === "out_of_stock" || product.inStock === false) {
      throw new OrderInputValidationError(`products[${index}] is out of stock`);
    }

    const colorVariant = findColorVariant(product, item.color);
    if (!colorVariant || colorVariant.active === false) {
      throw new OrderInputValidationError(`products[${index}].color is not a variant of this product or is unavailable`);
    }
    const lensOptions = Array.isArray(colorVariant.lensOptions) ? colorVariant.lensOptions : [];
    let lensOption = null;
    if (lensOptions.length) {
      if (!item.lensOption) throw new OrderInputValidationError(`products[${index}].lensOption is required for this color`);
      lensOption = findLensOption(colorVariant, item.lensOption);
      if (!lensOption || lensOption.active === false) {
        throw new OrderInputValidationError(`products[${index}].lensOption is not available for this color`);
      }
    } else if (item.lensOption) {
      throw new OrderInputValidationError(`products[${index}].lensOption is not a variant of this product`);
    }

    const unitPrice = finitePrice(lensOption?.price, colorVariant.price, product.sale_price);
    if (unitPrice === null) throw new OrderInputValidationError(`products[${index}] has no valid sale price`);
    const stock = lensOption
      ? finiteStock(lensOption.stock, colorVariant.stock)
      : finiteStock(colorVariant.stock);
    if (stock !== null && item.quantity > stock) {
      throw new OrderInputValidationError(`products[${index}] does not have enough stock`);
    }

    const colorVariantId = colorVariant._id || null;
    const lensOptionId = lensOption?._id || null;
    const imageUrl =
      lensOption?.images?.[0]?.url ||
      colorVariant?.images?.[0]?.url ||
      null;
    if (stock !== null) {
      reservations.push({
        productId: product._id,
        colorVariantId,
        lensOptionId: lensOption && lensOption.stock !== null && lensOption.stock !== undefined ? lensOptionId : null,
        quantity: item.quantity,
        index
      });
    }

    return {
      product: product._id,
      quantity: item.quantity,
      color: String(colorVariant.name || colorVariant.value || item.color).trim(),
      ...(colorVariantId ? { colorVariantId } : {}),
      ...(lensOptionId ? { lensOptionId } : {}),
      ...(lensOption?.type ? { lensType: String(lensOption.type).trim() } : {}),
      ...(lensOption?.category !== null && lensOption?.category !== undefined ? { lensCategory: Number(lensOption.category) } : {}),
      ...((lensOption?.sku || colorVariant.sku) ? { sku: String(lensOption?.sku || colorVariant.sku).trim() } : {}),
      inventorySource: lensOption && lensOption.stock !== null && lensOption.stock !== undefined
        ? "lens"
        : (colorVariant.stock !== null && colorVariant.stock !== undefined ? "color" : "none"),
      unitPrice,
      currency: "MAD",
      productName: String(product.name || "").trim(),
      ...(product.slug ? { productSlug: String(product.slug).trim() } : {}),
      ...(imageUrl ? { imageUrl: String(imageUrl).trim() } : {})
    };
  });
  return { orderItems, reservations };
};

const buildValidatedOrderItems = (requestedItems, products) => {
  return buildValidatedOrderSelection(requestedItems, products).orderItems;
};

const reserveInventory = async (reservations, ProductModel = Product, session = undefined) => {
  const completed = [];
  try {
    for (const reservation of reservations) {
      const query = { _id: reservation.productId, isActive: true };
      const options = {};
      let update;
      if (reservation.lensOptionId) {
        query.colors = {
          $elemMatch: {
            _id: reservation.colorVariantId,
            active: { $ne: false },
            lensOptions: {
              $elemMatch: {
                _id: reservation.lensOptionId,
                active: { $ne: false },
                stock: { $gte: reservation.quantity }
              }
            }
          }
        };
        update = { $inc: { 'colors.$[color].lensOptions.$[lens].stock': -reservation.quantity } };
        options.arrayFilters = [{ 'color._id': reservation.colorVariantId }, { 'lens._id': reservation.lensOptionId }];
      } else {
        query.colors = { $elemMatch: { _id: reservation.colorVariantId, active: { $ne: false }, stock: { $gte: reservation.quantity } } };
        update = { $inc: { 'colors.$[color].stock': -reservation.quantity } };
        options.arrayFilters = [{ 'color._id': reservation.colorVariantId }];
      }
      const result = await ProductModel.updateOne(query, update, { ...options, ...(session ? { session } : {}) });
      if (result.modifiedCount !== 1) {
        throw new OrderInputValidationError(`products[${reservation.index}] no longer has enough stock`);
      }
      completed.push(reservation);
    }
    return completed;
  } catch (error) {
    await releaseInventory(completed, ProductModel, session);
    throw error;
  }
};

const releaseInventory = async (reservations, ProductModel = Product, session = undefined) => {
  for (const reservation of [...reservations].reverse()) {
    const options = {};
    let update;
    if (reservation.lensOptionId) {
      update = { $inc: { 'colors.$[color].lensOptions.$[lens].stock': reservation.quantity } };
      options.arrayFilters = [{ 'color._id': reservation.colorVariantId }, { 'lens._id': reservation.lensOptionId }];
    } else {
      update = { $inc: { 'colors.$[color].stock': reservation.quantity } };
      options.arrayFilters = [{ 'color._id': reservation.colorVariantId }];
    }
    try {
      await ProductModel.updateOne({ _id: reservation.productId }, update, { ...options, ...(session ? { session } : {}) });
    } catch (_rollbackError) {
      console.error('Inventory rollback failed for an order item');
    }
  }
};

const restoreOrderInventory = async (order, { ProductModel = Product, session } = {}) => {
  for (const item of order.products || []) {
    let result;
    if (item.inventorySource === "lens" && item.colorVariantId && item.lensOptionId) {
      result = await ProductModel.updateOne(
        { _id: item.product },
        { $inc: { 'colors.$[color].lensOptions.$[lens].stock': item.quantity } },
        { session, arrayFilters: [{ 'color._id': item.colorVariantId }, { 'lens._id': item.lensOptionId }] }
      );
    } else if (item.inventorySource === "color" && item.colorVariantId) {
      result = await ProductModel.updateOne(
        { _id: item.product },
        { $inc: { 'colors.$[color].stock': item.quantity } },
        { session, arrayFilters: [{ 'color._id': item.colorVariantId }] }
      );
    } else {
      continue;
    }
    if (result.modifiedCount !== 1) throw new OrderInputValidationError("Order inventory variant could not be restored");
  }
};

const validationResponse = (res, error) => res.status(400).json({
  success: false,
  message: error.message,
  error: error.message
});

const getResponseStatusTransitions = () => {
  if (canUseTransactions()) return STATUS_TRANSITIONS;
  return Object.fromEntries(
    Object.entries(STATUS_TRANSITIONS).map(([status, transitions]) => [
      status,
      new Set(Array.from(transitions).filter((transition) => transition !== "cancelled"))
    ])
  );
};

const attachOrderComputedFields = (order) => serializeOrder(order, getResponseStatusTransitions());

const buildOrderCreation = async ({ validated, idempotencyKeyHash, session }) => {
  if (idempotencyKeyHash) {
    const existingOrder = await Order.findOne({ idempotencyKeyHash }).session(session || null);
    if (existingOrder) return { existingOrder };
  }

  const productIds = [...new Set(validated.products.map((item) => item.product))];
  const productQuery = Product.find({
    _id: { $in: productIds },
    isActive: true
  }).select(ORDER_PRODUCT_FIELDS).lean();
  if (session) productQuery.session(session);

  const availableProducts = await productQuery;
  const { orderItems, reservations } = buildValidatedOrderSelection(validated.products, availableProducts);
  const completedReservations = await reserveInventory(reservations, Product, session);

  // Delivery is priced from the server-derived subtotal, never from anything
  // the client sent, and snapshotted so a later fee change cannot rewrite it.
  const subtotal = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const order = new Order({
    products: orderItems,
    orderNumber: generateOrderNumber(),
    deliveryFee: calculateDeliveryFee(subtotal),
    fullName: validated.customer.fullName,
    email: validated.customer.email,
    phone: validated.customer.phone,
    adresse: validated.customer.adresse,
    city: validated.customer.city,
    ...(idempotencyKeyHash ? { idempotencyKeyHash } : {})
  });

  try {
    await order.save(session ? { session } : undefined);
    return { order, completedReservations };
  } catch (saveError) {
    if (!session) await releaseInventory(completedReservations);
    if (idempotencyKeyHash && saveError?.code === 11000) {
      const existingOrder = await Order.findOne({ idempotencyKeyHash }).session(session || null);
      if (existingOrder) return { existingOrder };
    }
    throw saveError;
  }
};

/**
 * Emails the customer a signed link to review what they just received.
 *
 * Best effort in every direction: no email address, no FRONTEND_URL, or a
 * failed send must never turn a successful status change into an error. The
 * order is already delivered; a missing review request is not worth a 500.
 */
const sendReviewInvitation = async (order) => {
  try {
    if (!order?.email) return;

    const siteUrl = String(process.env.FRONTEND_URL || "").trim().replace(/\/+$/, "");
    if (!siteUrl) {
      console.error("Cannot send a review invitation: FRONTEND_URL is not configured");
      return;
    }

    const token = createReviewToken(order._id);
    const reviewUrl = `${siteUrl}/review/${encodeURIComponent(token)}`;

    await sendEmail({
      to: order.email,
      subject: "Votre avis sur votre commande NAZRA",
      html: reviewInviteEmail(order, { fullName: order.fullName }, reviewUrl)
    });
  } catch (error) {
    console.error("Review invitation delivery failed:", error);
  }
};

const canUseTransactions = () => {
  const topologyType = Order.db?.client?.topology?.description?.type;
  return topologyType && topologyType !== "Single";
};

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const idempotencyKeyHash = parseIdempotencyKey(req.get("Idempotency-Key"));
    const validated = validateOrderRequest(req.body);

    let order;
    let existingOrder;
    if (canUseTransactions()) {
      const session = await Order.startSession();
      try {
        await session.withTransaction(async () => {
          const result = await buildOrderCreation({ validated, idempotencyKeyHash, session });
          order = result.order;
          existingOrder = result.existingOrder;
        });
      } finally {
        await session.endSession();
      }
    } else {
      const result = await buildOrderCreation({ validated, idempotencyKeyHash });
      order = result.order;
      existingOrder = result.existingOrder;
    }

    if (existingOrder) {
      res.set("Idempotency-Replayed", "true");
      return res.status(200).json({
        success: true,
        message: "Order already created",
        order: attachOrderComputedFields(existingOrder)
      });
    }

    try {
      await order.populate("products.product", ORDER_PRODUCT_FIELDS);
    } catch (_populateError) {
      console.error("Order created but product population failed");
    }

    // Settled independently: a missing ADMIN_EMAIL used to reject the whole
    // Promise.all and take the customer's confirmation down with it. The
    // customer email is also skipped entirely when no address was given, which
    // is now a normal case.
    const deliveries = await Promise.allSettled([
      validated.customer.email
        ? sendEmail({
            to: validated.customer.email,
            subject: "Your Order Confirmation",
            html: userOrderEmail(order, validated.customer)
          })
        : Promise.resolve(null),
      process.env.ADMIN_EMAIL
        ? sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: "New Order Received",
            html: adminOrderEmail(order, validated.customer)
          })
        : Promise.reject(new Error("ADMIN_EMAIL is not configured"))
    ]);

    const [customerDelivery, adminDelivery] = deliveries;
    const emailsSent = deliveries.every((entry) => entry.status === "fulfilled");
    if (customerDelivery.status === "rejected") {
      console.error("Order customer email delivery failed:", customerDelivery.reason);
    }
    // An admin who never learns an order arrived cannot fulfil it, so this is
    // the more urgent of the two failures.
    if (adminDelivery.status === "rejected") {
      console.error("Order admin notification failed:", adminDelivery.reason);
    }

    // Recorded on the order so a failure is visible in the dashboard instead of
    // living only in a log line nobody reads. Best-effort: the order itself is
    // already committed and must not be rolled back over an email.
    try {
      order.emailStatus = {
        customer: !validated.customer.email
          ? "skipped"
          : customerDelivery.status === "fulfilled" ? "sent" : "failed",
        admin: adminDelivery.status === "fulfilled" ? "sent" : "failed"
      };
      await order.save();
    } catch (statusError) {
      console.error("Could not record order email status:", statusError);
    }

    return res.status(201).json({
      success: true,
      message: emailsSent ? "Order created successfully and emails sent" : "Order created successfully",
      order: attachOrderComputedFields(order)
    });
  } catch (error) {
    if (error instanceof OrderInputValidationError || error?.name === "ValidationError") {
      return validationResponse(res, error);
    }
    console.error("Order creation error:", error);
    return res.status(500).json({ success: false, message: "Server error while creating order" });
  }
};

// Get all orders
// The admin dashboards (OrderStats, TopProducts, RecentOrders) still aggregate
// client-side over this list, so the default is set high enough not to skew
// their numbers for a young store. They should move to the server-side
// /api/admin/dashboard/summary metrics before order volume approaches this.
const ORDERS_DEFAULT_LIMIT = 500;
const ORDERS_MAX_LIMIT = 1000;

const readListLimit = (value) => {
  if (value === undefined) return ORDERS_DEFAULT_LIMIT;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) return null;
  return Math.min(parsed, ORDERS_MAX_LIMIT);
};

/**
 * Paginated. This previously returned every order ever placed, fully
 * populated, with each customer's name, phone and address in one response —
 * unbounded in both payload size and PII exposure.
 */
exports.getOrders = async (req, res) => {
  const limit = readListLimit(req.query.limit);
  const page = req.query.page === undefined ? 1 : Number(req.query.page);

  if (limit === null || !Number.isSafeInteger(page) || page < 1) {
    return res.status(400).json({ success: false, message: "page and limit must be positive integers" });
  }

  try {
    const [orders, total] = await Promise.all([
      Order.find()
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("products.product", ORDER_PRODUCT_FIELDS),
      Order.estimatedDocumentCount()
    ]);

    return res.status(200).json({
      success: true,
      orders: orders.map(attachOrderComputedFields),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ success: false, message: "Server error while fetching orders" });
  }
};

// Get single order by ID
exports.getOrderById = async (req, res) => {
  if (!isObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid order id" });
  }
  try {
    const order = await Order.findById(req.params.id).populate("products.product", ORDER_PRODUCT_FIELDS);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    return res.status(200).json({ success: true, order: attachOrderComputedFields(order) });
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({ success: false, message: "Server error while fetching order" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const status = typeof req.body?.status === "string" ? req.body.status.trim() : "";
  if (!isObjectId(orderId)) {
    return res.status(400).json({ success: false, message: "Invalid order id" });
  }
  if (!status) {
    return res.status(400).json({ success: false, message: "Status is required" });
  }

  if (!Object.prototype.hasOwnProperty.call(STATUS_TRANSITIONS, status)) {
    return res.status(400).json({ success: false, message: "Invalid status value" });
  }

  try {
    const current = await Order.findById(orderId);
    if (!current) return res.status(404).json({ success: false, message: "Order not found" });
    if (current.status === status) {
      return res.status(200).json({ success: true, message: `Order status is already ${status}`, order: attachOrderComputedFields(current) });
    }
    if (!STATUS_TRANSITIONS[current.status]?.has(status)) {
      return res.status(409).json({ success: false, message: `Order cannot transition from ${current.status} to ${status}` });
    }

    let order;
    if (status === "cancelled") {
      if (!canUseTransactions()) {
        return res.status(503).json({
          success: false,
          code: "SERVICE_UNAVAILABLE",
          message: "Cancelling orders safely requires MongoDB transaction support."
        });
      }
      const session = await Order.startSession();
      try {
        await session.withTransaction(async () => {
          const transactionOrder = await Order.findById(orderId).session(session);
          if (!transactionOrder) throw new OrderInputValidationError("Order not found");
          if (transactionOrder.status === "cancelled") {
            order = transactionOrder;
            return;
          }
          if (!STATUS_TRANSITIONS[transactionOrder.status]?.has("cancelled")) {
            throw new OrderInputValidationError(`Order cannot transition from ${transactionOrder.status} to cancelled`);
          }
          await restoreOrderInventory(transactionOrder, { session });
          transactionOrder.status = "cancelled";
          transactionOrder.inventoryRestoredAt = new Date();
          await transactionOrder.save({ session });
          order = transactionOrder;
        });
      } finally {
        await session.endSession();
      }
    } else {
      order = await Order.findOneAndUpdate(
        { _id: orderId, status: current.status },
        { $set: { status } },
        { new: true, runValidators: true }
      );
      if (!order) return res.status(409).json({ success: false, message: "Order status changed concurrently" });
    }

    // Delivery is the only moment a review invitation is honest: the customer
    // now has the product. Sent once, on the transition, and never retried —
    // the transition itself is guarded above so this cannot fire twice.
    if (status === "delivered") {
      await sendReviewInvitation(order);
    }

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order: attachOrderComputedFields(order)
    });
  } catch (error) {
    if (error instanceof OrderInputValidationError) {
      return res.status(409).json({ success: false, message: error.message });
    }
    console.error("Error updating order status:", error);
    return res.status(500).json({ success: false, message: "Server error while updating order status" });
  }
};

exports._test = {
  MAX_ITEM_QUANTITY,
  MAX_ORDER_ITEMS,
  OrderInputValidationError,
  buildValidatedOrderItems,
  buildValidatedOrderSelection,
  findColorVariant,
  findLensOption,
  isObjectId,
  parseIdempotencyKey,
  releaseInventory,
  reserveInventory,
  restoreOrderInventory,
  STATUS_TRANSITIONS,
  validateOrderRequest,
  NON_CANCELLED_STATUSES,
  SALES_STATUSES,
  calculateOrderTotal,
  attachOrderComputedFields,
  canUseTransactions,
  getResponseStatusTransitions
};

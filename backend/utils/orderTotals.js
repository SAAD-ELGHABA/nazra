const NON_CANCELLED_STATUSES = new Set(["pending", "processing", "shipped", "delivered"]);
const SALES_STATUSES = new Set(["processing", "shipped", "delivered"]);

const toFiniteMoney = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
};

const toFiniteQuantity = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
};

const calculateLineTotal = (lineItem) => {
  return toFiniteMoney(lineItem?.unitPrice) * toFiniteQuantity(lineItem?.quantity);
};

const calculateOrderSubtotal = (order) => {
  return (order?.products || []).reduce((total, item) => total + calculateLineTotal(item), 0);
};

/**
 * Delivery charged on this order. Reads the snapshot stored at creation, so
 * orders placed before the fee existed correctly report 0.
 */
const calculateOrderDeliveryFee = (order) => toFiniteMoney(order?.deliveryFee);

/**
 * What the customer hands the courier: goods plus delivery.
 *
 * Deliberately NOT what the admin dashboard counts as revenue — delivery is
 * passed through to the courier, so the sales metrics keep using
 * `calculateOrderSubtotal`. Changing that here would silently inflate revenue.
 */
const calculateOrderTotal = (order) => {
  return calculateOrderSubtotal(order) + calculateOrderDeliveryFee(order);
};

const getAllowedTransitions = (status, transitions) => {
  return Array.from(transitions?.[status] || []);
};

const serializeOrder = (order, transitions) => {
  const plainOrder = typeof order?.toObject === "function" ? order.toObject() : { ...order };
  const subtotal = calculateOrderSubtotal(plainOrder);
  const deliveryFee = calculateOrderDeliveryFee(plainOrder);
  const total = calculateOrderTotal(plainOrder);

  return {
    ...plainOrder,
    subtotal,
    deliveryFee,
    total,
    currency: plainOrder.currency || "MAD",
    allowedTransitions: getAllowedTransitions(plainOrder.status, transitions)
  };
};

module.exports = {
  NON_CANCELLED_STATUSES,
  SALES_STATUSES,
  calculateLineTotal,
  calculateOrderDeliveryFee,
  calculateOrderSubtotal,
  calculateOrderTotal,
  serializeOrder
};

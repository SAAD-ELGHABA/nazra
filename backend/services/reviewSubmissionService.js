const Order = require("../models/Order");
const Review = require("../models/Review");
const { verifyReviewToken } = require("../utils/reviewToken");

/**
 * Guest review submission, authorised by a signed invitation rather than a
 * session.
 *
 * Three things make `verifiedPurchase` an honest claim here:
 *   1. the token is signed and names one specific order;
 *   2. the order must actually be delivered;
 *   3. the product must appear on that order.
 * All three are checked server-side on every submission.
 */

class ReviewValidationError extends Error {}

const MIN_COMMENT = 10;
const MAX_COMMENT = 2000;
const MAX_TITLE = 120;
const MAX_DISPLAY_NAME = 80;

/** Only a delivered order can be reviewed — nothing else proves receipt. */
const REVIEWABLE_STATUSES = new Set(["delivered"]);

const isObjectId = (value) => /^[a-f\d]{24}$/i.test(String(value || ""));

const cleanText = (value) => typeof value === "string"
  ? value.normalize("NFKC").replace(/\r\n?/g, "\n").trim()
  : "";

/**
 * "Yassine El Amrani" -> "Yassine E."
 *
 * Reviews are public. Publishing a customer's full name alongside a product
 * they bought is more personal data than the review needs, so only a first
 * name and an initial are ever stored for display.
 */
const toDisplayName = (fullName) => {
  const parts = cleanText(fullName).split(/\s+/).filter(Boolean);
  if (!parts.length) return "Client";
  const [first, ...rest] = parts;
  const initial = rest.length ? ` ${rest[rest.length - 1].charAt(0).toUpperCase()}.` : "";
  return `${first}${initial}`.slice(0, MAX_DISPLAY_NAME);
};

const readRating = (value) => {
  const rating = Number(value);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ReviewValidationError("rating must be a whole number between 1 and 5");
  }
  return rating;
};

/** Resolves a token to the order it was issued for, or throws. */
const loadInvitedOrder = async (token) => {
  const orderId = verifyReviewToken(token);
  const order = await Order.findById(orderId)
    .select("fullName status products.product products.productName products.productSlug products.imageUrl")
    .lean();

  if (!order) throw new ReviewValidationError("This order could not be found");
  if (!REVIEWABLE_STATUSES.has(order.status)) {
    throw new ReviewValidationError("This order is not marked as delivered yet");
  }
  return order;
};

/**
 * What the review page shows: the products on the order, and which of them
 * have already been reviewed so the form can hide them.
 */
const getReviewInvitation = async (token) => {
  const order = await loadInvitedOrder(token);

  const existing = await Review.find({ order: order._id }).select("product").lean();
  const reviewed = new Set(existing.map((review) => String(review.product)));

  // De-duplicated: the same product can appear on an order under two variants,
  // but it is still one product to review.
  const seen = new Set();
  const products = (order.products || []).reduce((list, item) => {
    const productId = String(item.product || "");
    if (!isObjectId(productId) || seen.has(productId)) return list;
    seen.add(productId);
    list.push({
      productId,
      name: item.productName || "",
      slug: item.productSlug || "",
      imageUrl: item.imageUrl || "",
      alreadyReviewed: reviewed.has(productId),
    });
    return list;
  }, []);

  return {
    displayName: toDisplayName(order.fullName),
    products,
    // Nothing left to do — the page says thank you instead of showing a form.
    completed: products.length > 0 && products.every((product) => product.alreadyReviewed),
  };
};

/**
 * Creates a pending review. Never published directly: an admin approves it
 * through the moderation surface that already exists.
 */
const submitReview = async ({ token, productId, rating, title, comment }) => {
  const order = await loadInvitedOrder(token);

  if (!isObjectId(productId)) throw new ReviewValidationError("A valid product is required");
  const onOrder = (order.products || []).some((item) => String(item.product) === String(productId));
  if (!onOrder) throw new ReviewValidationError("This product is not part of your order");

  const parsedRating = readRating(rating);
  const parsedComment = cleanText(comment);
  if (parsedComment.length < MIN_COMMENT || parsedComment.length > MAX_COMMENT) {
    throw new ReviewValidationError(`comment must contain between ${MIN_COMMENT} and ${MAX_COMMENT} characters`);
  }
  const parsedTitle = cleanText(title).slice(0, MAX_TITLE);

  try {
    const review = await Review.create({
      product: productId,
      order: order._id,
      displayName: toDisplayName(order.fullName),
      rating: parsedRating,
      title: parsedTitle,
      comment: parsedComment,
      // Guaranteed by the checks above, and immutable on the schema.
      verifiedPurchase: true,
      status: "pending",
    });
    return { id: String(review._id), status: review.status };
  } catch (error) {
    // The unique (order, product) index is what enforces single use.
    if (error?.code === 11000) {
      throw new ReviewValidationError("You have already reviewed this product");
    }
    throw error;
  }
};

module.exports = {
  MAX_COMMENT,
  MIN_COMMENT,
  ReviewValidationError,
  getReviewInvitation,
  submitReview,
  toDisplayName,
};

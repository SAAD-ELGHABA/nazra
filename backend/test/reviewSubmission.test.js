const assert = require("node:assert/strict");
const test = require("node:test");

process.env.REVIEW_TOKEN_PEPPER = process.env.REVIEW_TOKEN_PEPPER
  || "test-review-token-pepper-at-least-32-characters";

const Order = require("../models/Order");
const Review = require("../models/Review");
const { createReviewToken } = require("../utils/reviewToken");
const {
  ReviewValidationError,
  getReviewInvitation,
  submitReview
} = require("../services/reviewSubmissionService");

const ORDER_ID = "64b000000000000000000001";
const PRODUCT_A = "64b0000000000000000000aa";
const PRODUCT_B = "64b0000000000000000000bb";

const deliveredOrder = (overrides = {}) => ({
  _id: ORDER_ID,
  fullName: "Yassine El Amrani",
  status: "delivered",
  products: [
    { product: PRODUCT_A, productName: "Verona Gold", productSlug: "verona-gold", imageUrl: "https://img/a.png" },
    { product: PRODUCT_A, productName: "Verona Gold", productSlug: "verona-gold", imageUrl: "https://img/a.png" },
    { product: PRODUCT_B, productName: "Atlas Bold", productSlug: "atlas-bold", imageUrl: "https://img/b.png" }
  ],
  ...overrides
});

/** Replaces the two model calls the service makes, restoring them afterwards. */
const withStubs = async ({ order, existingReviews = [], onCreate }, run) => {
  const realFindById = Order.findById;
  const realFind = Review.find;
  const realCreate = Review.create;

  Order.findById = () => ({ select: () => ({ lean: async () => order }) });
  Review.find = () => ({ select: () => ({ lean: async () => existingReviews }) });
  Review.create = async (doc) => {
    if (onCreate) return onCreate(doc);
    return { _id: "64b0000000000000000000cc", status: doc.status };
  };

  try {
    await run();
  } finally {
    Order.findById = realFindById;
    Review.find = realFind;
    Review.create = realCreate;
  }
};

test("an invitation lists each ordered product once", async () => {
  await withStubs({ order: deliveredOrder() }, async () => {
    const invitation = await getReviewInvitation(createReviewToken(ORDER_ID));

    // PRODUCT_A appears twice on the order but is still one product to review.
    assert.equal(invitation.products.length, 2);
    assert.deepEqual(invitation.products.map((p) => p.productId), [PRODUCT_A, PRODUCT_B]);
    assert.equal(invitation.displayName, "Yassine A.");
    assert.equal(invitation.completed, false);
  });
});

test("products already reviewed are flagged, and a finished order is complete", async () => {
  await withStubs({
    order: deliveredOrder(),
    existingReviews: [{ product: PRODUCT_A }, { product: PRODUCT_B }]
  }, async () => {
    const invitation = await getReviewInvitation(createReviewToken(ORDER_ID));
    assert.ok(invitation.products.every((product) => product.alreadyReviewed));
    assert.equal(invitation.completed, true);
  });
});

test("an order that is not delivered cannot be reviewed", async () => {
  for (const status of ["pending", "processing", "shipped", "cancelled"]) {
    await withStubs({ order: deliveredOrder({ status }) }, async () => {
      await assert.rejects(
        () => getReviewInvitation(createReviewToken(ORDER_ID)),
        /not marked as delivered/
      );
    });
  }
});

test("a valid submission is stored as pending and verified", async () => {
  let created = null;
  await withStubs({
    order: deliveredOrder(),
    onCreate: (doc) => { created = doc; return { _id: "64b0000000000000000000cc", status: doc.status }; }
  }, async () => {
    const result = await submitReview({
      token: createReviewToken(ORDER_ID),
      productId: PRODUCT_A,
      rating: 5,
      title: "  Parfait  ",
      comment: "  Très confortables et livrées en deux jours.  "
    });

    assert.equal(result.status, "pending");
    assert.equal(created.status, "pending");
    assert.equal(created.verifiedPurchase, true);
    assert.equal(created.rating, 5);
    assert.equal(created.title, "Parfait");
    assert.equal(created.comment, "Très confortables et livrées en deux jours.");
    // Only a first name and an initial are ever published.
    assert.equal(created.displayName, "Yassine A.");
    assert.equal(String(created.order), ORDER_ID);
  });
});

test("a product that is not on the order is refused", async () => {
  await withStubs({ order: deliveredOrder() }, async () => {
    await assert.rejects(
      () => submitReview({
        token: createReviewToken(ORDER_ID),
        productId: "64b0000000000000000000ff",
        rating: 5,
        comment: "Trying to review something I did not buy."
      }),
      /not part of your order/
    );
  });
});

test("ratings outside 1-5 and short comments are refused", async () => {
  await withStubs({ order: deliveredOrder() }, async () => {
    const base = { token: createReviewToken(ORDER_ID), productId: PRODUCT_A };

    for (const rating of [0, 6, 4.5, -1, "five", null]) {
      await assert.rejects(
        () => submitReview({ ...base, rating, comment: "A perfectly reasonable comment." }),
        ReviewValidationError
      );
    }
    await assert.rejects(
      () => submitReview({ ...base, rating: 5, comment: "short" }),
      /between 10 and 2000/
    );
  });
});

test("replaying the same link cannot create a second review", async () => {
  await withStubs({
    order: deliveredOrder(),
    onCreate: () => {
      // What the unique (order, product) index raises.
      const duplicate = new Error("E11000 duplicate key error");
      duplicate.code = 11000;
      throw duplicate;
    }
  }, async () => {
    await assert.rejects(
      () => submitReview({
        token: createReviewToken(ORDER_ID),
        productId: PRODUCT_A,
        rating: 5,
        comment: "Attempting to submit this review twice over."
      }),
      /already reviewed/
    );
  });
});

test("a forged or expired token never reaches the database", async () => {
  let touched = false;
  await withStubs({
    order: deliveredOrder(),
    onCreate: () => { touched = true; return {}; }
  }, async () => {
    await assert.rejects(
      () => submitReview({ token: "forged.token", productId: PRODUCT_A, rating: 5, comment: "Should never land." }),
      /Invalid review link/
    );
  });
  assert.equal(touched, false);
});

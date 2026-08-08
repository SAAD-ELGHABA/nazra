/**
 * Delivery pricing — a flat nationwide fee, decided by the server.
 *
 * The client displays the fee, it never supplies it. The amount charged is
 * snapshotted onto each order at creation, so changing the fee later never
 * rewrites the history of what a customer was actually asked to pay.
 */

/**
 * ⚠️ SET THIS BEFORE TAKING REAL ORDERS.
 *
 * Default is 0 (free delivery) — deliberately the safe direction to fail: if
 * the variable is unset, the customer is never surprised by a charge that was
 * not on screen. Set DELIVERY_FEE_MAD in the backend environment to the real
 * courier price.
 */
const DEFAULT_DELIVERY_FEE_MAD = 0;

/**
 * Orders at or above this subtotal ship free. 0 disables the threshold.
 * Set DELIVERY_FREE_THRESHOLD_MAD to enable it.
 */
const DEFAULT_FREE_THRESHOLD_MAD = 0;

const readMoney = (value, fallback) => {
  if (value === undefined || value === null || `${value}`.trim() === "") return fallback;
  const parsed = Number(value);
  // A malformed value must not silently become a charge.
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.round(parsed * 100) / 100;
};

const getDeliveryFeeAmount = () => readMoney(process.env.DELIVERY_FEE_MAD, DEFAULT_DELIVERY_FEE_MAD);
const getFreeDeliveryThreshold = () => readMoney(process.env.DELIVERY_FREE_THRESHOLD_MAD, DEFAULT_FREE_THRESHOLD_MAD);

/**
 * The fee for a given order subtotal. An empty order is never charged for
 * delivery — there is nothing to deliver.
 */
const calculateDeliveryFee = (subtotal) => {
  const amount = Number(subtotal);
  if (!Number.isFinite(amount) || amount <= 0) return 0;

  const threshold = getFreeDeliveryThreshold();
  if (threshold > 0 && amount >= threshold) return 0;

  return getDeliveryFeeAmount();
};

module.exports = {
  DEFAULT_DELIVERY_FEE_MAD,
  DEFAULT_FREE_THRESHOLD_MAD,
  calculateDeliveryFee,
  getDeliveryFeeAmount,
  getFreeDeliveryThreshold,
};

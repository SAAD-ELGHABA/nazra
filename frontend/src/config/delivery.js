/**
 * Delivery fee shown in the cart and checkout summary.
 *
 * DISPLAY ONLY. The server recalculates the fee on every order and is the sole
 * authority on what the customer is charged — see `backend/config/delivery.js`.
 * These variables exist so the summary can show a figure before the order is
 * placed; keep them in step with the backend's `DELIVERY_FEE_MAD` and
 * `DELIVERY_FREE_THRESHOLD_MAD`.
 *
 * Unset means free delivery, matching the backend default. That is the safe
 * direction to fail: the customer is never shown a charge the server would not
 * apply, and never surprised by one it would.
 */

const readMoney = (value) => {
  const parsed = Number(`${value ?? ""}`.trim());
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) / 100 : 0;
};

export const DELIVERY_FEE_MAD = readMoney(import.meta.env.VITE_DELIVERY_FEE_MAD);
export const DELIVERY_FREE_THRESHOLD_MAD = readMoney(import.meta.env.VITE_DELIVERY_FREE_THRESHOLD_MAD);

/** Mirrors `calculateDeliveryFee` in the backend config. */
export const estimateDeliveryFee = (subtotal) => {
  const amount = Number(subtotal);
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  if (DELIVERY_FREE_THRESHOLD_MAD > 0 && amount >= DELIVERY_FREE_THRESHOLD_MAD) return 0;
  return DELIVERY_FEE_MAD;
};

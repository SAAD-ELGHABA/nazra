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

const calculateOrderTotal = (order) => {
  return calculateOrderSubtotal(order);
};

const getAllowedTransitions = (status, transitions) => {
  return Array.from(transitions?.[status] || []);
};

const serializeOrder = (order, transitions) => {
  const plainOrder = typeof order?.toObject === "function" ? order.toObject() : { ...order };
  const subtotal = calculateOrderSubtotal(plainOrder);
  const total = calculateOrderTotal(plainOrder);

  return {
    ...plainOrder,
    subtotal,
    total,
    currency: plainOrder.currency || "MAD",
    allowedTransitions: getAllowedTransitions(plainOrder.status, transitions)
  };
};

module.exports = {
  NON_CANCELLED_STATUSES,
  SALES_STATUSES,
  calculateLineTotal,
  calculateOrderSubtotal,
  calculateOrderTotal,
  serializeOrder
};

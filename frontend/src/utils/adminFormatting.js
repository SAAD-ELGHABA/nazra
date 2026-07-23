export const formatMAD = (value, { compact = false } = {}) => {
  const amount = Number(value || 0);
  return `${new Intl.NumberFormat("fr-MA", {
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 0 : 2,
  }).format(Number.isFinite(amount) ? amount : 0)} ${compact ? "DH" : "MAD"}`;
};

export const getLineUnitPrice = (item) => Number(item?.unitPrice || 0);

export const getLineTotal = (item) => {
  const quantity = Number(item?.quantity || 0);
  return getLineUnitPrice(item) * (Number.isFinite(quantity) ? quantity : 0);
};

export const getOrderTotal = (order) => {
  const preferredTotal = Number(order?.total ?? order?.subtotal);
  if (Number.isFinite(preferredTotal)) return preferredTotal;
  return (order?.products || []).reduce((total, item) => total + getLineTotal(item), 0);
};

export const getProductSnapshotName = (item) => (
  item?.productName ||
  item?.product?.name ||
  "Product unavailable"
);

export const getProductSnapshotSlug = (item) => item?.productSlug || item?.product?.slug || "";

export const getProductSnapshotImage = (item) => (
  item?.imageUrl ||
  item?.product?.colors?.[0]?.images?.[0]?.url ||
  item?.product?.images?.[0]?.url ||
  ""
);

export const isNonCancelledOrder = (order) => order?.status !== "cancelled";

export const neutralizeSpreadsheetCell = (value) => {
  const text = String(value ?? "");
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
};

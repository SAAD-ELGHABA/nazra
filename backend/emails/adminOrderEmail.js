const { calculateLineTotal, calculateOrderTotal } = require("../utils/orderTotals");
const { escapeHtml } = require("../utils/sanitizeHtml");

const formatMAD = (value) => `${Number(value || 0).toFixed(2)} MAD`;

exports.adminOrderEmail = (order, customer) => {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff; color: #000; padding: 20px; border-radius: 8px; border: 1px solid #e5e5e5;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #000; font-size: 22px; margin-bottom: 5px;">New Order Received</h1>
      <p style="font-size: 16px; color: #555;">Order from ${escapeHtml(customer.fullName)}</p>
    </div>

    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #e5e5e5; margin-bottom: 20px;">
      <h2 style="font-size: 18px; margin-bottom: 10px; color: #000; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Customer Details</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><td style="padding: 8px; font-weight: bold;">Name:</td><td style="padding: 8px;">${escapeHtml(customer.fullName)}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${escapeHtml(customer.email)}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Phone:</td><td style="padding: 8px;">${escapeHtml(customer.phone)}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Address:</td><td style="padding: 8px;">${escapeHtml(customer.adresse)}</td></tr>
      </table>
    </div>

    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #e5e5e5;">
      <h2 style="font-size: 18px; margin-bottom: 10px; color: #000; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Order Items</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Product</th>
            <th style="text-align: center; padding: 8px; border-bottom: 1px solid #ddd;">Quantity</th>
            <th style="text-align: center; padding: 8px; border-bottom: 1px solid #ddd;">Color</th>
            <th style="text-align: center; padding: 8px; border-bottom: 1px solid #ddd;">Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${(order.products || []).map((p) => {
            const name = p.productName || p.product?.name || "Product unavailable";
            const image = p.imageUrl || p.product?.colors?.[0]?.images?.[0]?.url || "";
            return `
            <tr>
              <td style="padding: 8px;">
                ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(name)}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; vertical-align: middle; margin-right: 10px;" />` : ""}
                <span>${escapeHtml(name)}</span>
              </td>
              <td style="padding: 8px; text-align: center;">${Number(p.quantity || 0)}</td>
              <td style="padding: 8px; text-align: center;">${escapeHtml(p.color || "N/A")}</td>
              <td style="padding: 8px; text-align: center;">${formatMAD(calculateLineTotal(p))}</td>
            </tr>`;
          }).join("")}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
            <td style="padding: 10px; text-align: center; font-weight: bold;">${formatMAD(calculateOrderTotal(order))}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>`;
};

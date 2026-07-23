const { calculateLineTotal, calculateOrderTotal } = require("../utils/orderTotals");
const { escapeHtml } = require("../utils/sanitizeHtml");

const formatMAD = (value) => `${Number(value || 0).toFixed(2)} MAD`;

exports.userOrderEmail = (order, customer) => {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #fff; color: #000; padding: 5px; border-radius: 8px; border: 1px solid #e5e5e5;">
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://res.cloudinary.com/dmiaxmuiy/image/upload/v1759146693/nazra-email-logo_iakzho.png" alt="Nazra Glasses" style="max-width: 150px; margin-bottom: 15px;" />
      <h1 style="color: #000; font-weight: bold; font-size: 22px; margin-bottom: 5px;">Merci pour votre commande, ${escapeHtml(customer.fullName)} !</h1>
      <p style="font-size: 16px; color: #555;">Votre commande a ete passee avec succes !</p>
    </div>

    <div style="background-color: #f9f9f9; padding: 5px; border-radius: 8px; border: 1px solid #e5e5e5;">
      <h2 style="font-size: 18px; margin-bottom: 15px; color: #000; border-bottom: 1px solid #e5e5e5; padding-bottom: 10px;">Details de la commande</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 5px; border-bottom: 1px solid #ddd;">Produit</th>
            <th style="text-align: left; padding: 5px; border-bottom: 1px solid #ddd;">Nom</th>
            <th style="text-align: center; padding: 5px; border-bottom: 1px solid #ddd;">Quantite</th>
            <th style="text-align: center; padding: 5px; border-bottom: 1px solid #ddd;">Couleur</th>
            <th style="text-align: center; padding: 5px; border-bottom: 1px solid #ddd;">Prix</th>
            <th style="text-align: center; padding: 5px; border-bottom: 1px solid #ddd;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${(order.products || []).map((p) => {
            const name = p.productName || p.product?.name || "Product unavailable";
            const image = p.imageUrl || p.product?.colors?.[0]?.images?.[0]?.url || "";
            return `
            <tr>
              <td style="padding: 5px; text-align: center;">
                ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(name)}" style="max-width: 60px; border-radius: 4px;" />` : ""}
              </td>
              <td style="padding: 5px;">${escapeHtml(name)}</td>
              <td style="padding: 5px; text-align: center;">${Number(p.quantity || 0)}</td>
              <td style="padding: 5px; text-align: center;">${escapeHtml(p.color || "N/A")}</td>
              <td style="padding: 5px; text-align: center;">${formatMAD(p.unitPrice)}</td>
              <td style="padding: 5px; text-align: center;">${formatMAD(calculateLineTotal(p))}</td>
            </tr>`;
          }).join("")}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
            <td style="padding: 10px; text-align: center; font-weight: bold;">${formatMAD(calculateOrderTotal(order))}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div style="margin-top: 30px; font-size: 14px; color: #555;">
      <p>Votre commande a ete soumise.</p>
      <p>Nous allons vous contacter des que possible. Merci pour votre confiance et a tres bientot.</p>
    </div>
  </div>`;
};

const { escapeHtml } = require("../utils/sanitizeHtml");

/**
 * Sent once, when an order is marked delivered.
 *
 * The link carries a signed token naming that order, which is what lets a
 * guest leave a review that can honestly be labelled a verified purchase.
 */
exports.reviewInviteEmail = (order, customer, reviewUrl) => {
  const items = (order.products || [])
    .map((item) => item.productName || item.product?.name)
    .filter(Boolean);
  const uniqueItems = [...new Set(items)];

  return `
  <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #fff; color: #000; padding: 5px; border-radius: 8px; border: 1px solid #e5e5e5;">
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://res.cloudinary.com/dmiaxmuiy/image/upload/v1759146693/nazra-email-logo_iakzho.png" alt="Nazra Glasses" style="max-width: 150px; margin-bottom: 15px;" />
      <h1 style="color: #000; font-weight: bold; font-size: 22px; margin-bottom: 5px;">Votre avis compte, ${escapeHtml(customer.fullName || "")} !</h1>
      <p style="font-size: 16px; color: #555;">Votre commande a bien ete livree. Comment la trouvez-vous ?</p>
    </div>

    ${uniqueItems.length ? `
    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #e5e5e5; margin-bottom: 20px;">
      <p style="margin: 0 0 10px; font-size: 14px; color: #555;">Vous avez commande :</p>
      <ul style="margin: 0; padding-left: 20px; font-size: 15px; color: #000;">
        ${uniqueItems.map((name) => `<li style="margin-bottom: 6px;">${escapeHtml(name)}</li>`).join("")}
      </ul>
    </div>` : ""}

    <div style="text-align: center; margin: 25px 0;">
      <a href="${escapeHtml(reviewUrl)}" style="display: inline-block; background-color: #000; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 4px; font-size: 15px; font-weight: bold;">
        Laisser un avis
      </a>
      <p style="margin-top: 12px; font-size: 12px; color: #888;">Ce lien vous est personnel et reste valable 60 jours.</p>
    </div>

    <p style="font-size: 13px; color: #777; text-align: center; line-height: 20px;">
      Un souci avec votre commande ? Repondez simplement a cet e-mail, nous vous repondrons.
    </p>
  </div>`;
};

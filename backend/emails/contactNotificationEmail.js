const SUBJECT_LABELS = Object.freeze({
  order: "Question sur une commande",
  shipping: "Livraison",
  returns: "Retour ou échange",
  product: "Produit",
  payment: "Paiement",
  partnership: "Partenariat",
  press: "Presse",
  other: "Autre"
});

const escapeHtml = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const contactNotificationEmail = (contactMessage) => {
  const submittedAt = contactMessage.createdAt instanceof Date
    ? contactMessage.createdAt.toISOString()
    : new Date(contactMessage.createdAt || Date.now()).toISOString();
  const subjectLabel = SUBJECT_LABELS[contactMessage.subject] || SUBJECT_LABELS.other;
  const phone = contactMessage.phone || "Non renseigné";

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#151515">
      <div style="border-bottom:2px solid #b78a43;padding:20px 0">
        <h1 style="font-size:22px;margin:0">Nouveau message de contact NAZRA</h1>
      </div>
      <table role="presentation" style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px">
        <tr><th style="text-align:left;padding:8px;border-bottom:1px solid #e6dfd4">Sujet</th><td style="padding:8px;border-bottom:1px solid #e6dfd4">${escapeHtml(subjectLabel)}</td></tr>
        <tr><th style="text-align:left;padding:8px;border-bottom:1px solid #e6dfd4">Nom</th><td style="padding:8px;border-bottom:1px solid #e6dfd4">${escapeHtml(contactMessage.name)}</td></tr>
        <tr><th style="text-align:left;padding:8px;border-bottom:1px solid #e6dfd4">Email</th><td style="padding:8px;border-bottom:1px solid #e6dfd4">${escapeHtml(contactMessage.email)}</td></tr>
        <tr><th style="text-align:left;padding:8px;border-bottom:1px solid #e6dfd4">Téléphone</th><td style="padding:8px;border-bottom:1px solid #e6dfd4">${escapeHtml(phone)}</td></tr>
        <tr><th style="text-align:left;padding:8px;border-bottom:1px solid #e6dfd4">Date</th><td style="padding:8px;border-bottom:1px solid #e6dfd4">${escapeHtml(submittedAt)}</td></tr>
      </table>
      <div style="background:#f7f2e9;border:1px solid #e6dfd4;padding:18px;white-space:pre-wrap;line-height:1.6">${escapeHtml(contactMessage.message)}</div>
    </div>`;

  const text = [
    "Nouveau message de contact NAZRA",
    `Sujet: ${subjectLabel}`,
    `Nom: ${contactMessage.name}`,
    `Email: ${contactMessage.email}`,
    `Téléphone: ${phone}`,
    `Date: ${submittedAt}`,
    "",
    contactMessage.message
  ].join("\n");

  return { html, text, subjectLabel };
};

module.exports = { contactNotificationEmail, escapeHtml, SUBJECT_LABELS };


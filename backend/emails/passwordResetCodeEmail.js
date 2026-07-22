const escapeHtml = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

const passwordResetCodeEmail = ({ name, code, expiresInMinutes, resetPageUrl }) => {
  const safeName = escapeHtml(name || "Administrator");
  const safeCode = escapeHtml(code);
  const safeResetPageUrl = escapeHtml(resetPageUrl);
  const subject = "Your NAZRA password reset code";
  return {
    subject,
    text: `Hello ${name || "Administrator"},\n\nYour NAZRA password reset code is ${code}. It expires in ${expiresInMinutes} minutes.\n\nOpen the password reset page: ${resetPageUrl}\n\nIf you did not request this, you can ignore this email.`,
    html: `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111"><p>Hello ${safeName},</p><p>Your NAZRA password reset code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${safeCode}</p><p>This code expires in ${expiresInMinutes} minutes.</p><p><a href="${safeResetPageUrl}">Open the password reset page</a></p><p>If you did not request this, you can ignore this email.</p></body></html>`
  };
};

module.exports = { passwordResetCodeEmail, _test: { escapeHtml } };

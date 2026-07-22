const nodemailer = require("nodemailer");

let transporter;

const getEmailCredentials = () => ({
  user: process.env.SMTP_USER || process.env.EMAIL_USER,
  pass: (() => {
    const value = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    return typeof value === "string" && host.toLowerCase() === "smtp.gmail.com"
      ? value.replace(/\s+/g, "")
      : value;
  })()
});

const isEmailConfigured = () => {
  const { user, pass } = getEmailCredentials();
  return Boolean(user && pass);
};

const getTransporter = () => {
  if (!isEmailConfigured()) {
    throw new Error("Email transport is not configured");
  }
  if (!transporter) {
    const credentials = getEmailCredentials();
    const port = Number(process.env.SMTP_PORT || 465);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port,
      secure: process.env.SMTP_SECURE
        ? process.env.SMTP_SECURE === "true"
        : port === 465,
      auth: {
        user: credentials.user,
        pass: credentials.pass
      },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 15000
    });
  }
  return transporter;
};

exports.sendEmail = async ({ to, subject, html, text, replyTo }) => {
  if (!to || !subject || (!html && !text)) throw new Error("Invalid email payload");
  const credentials = getEmailCredentials();
  return getTransporter().sendMail({
    from: process.env.EMAIL_FROM || `"NAZRA" <${credentials.user}>`,
    to,
    subject,
    html,
    text,
    ...(replyTo ? { replyTo } : {})
  });
};

exports.isEmailConfigured = isEmailConfigured;
exports._test = {
  getEmailCredentials,
  getTransporter,
  resetTransporter: () => { transporter = undefined; }
};

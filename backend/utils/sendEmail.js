const nodemailer = require("nodemailer");

let transporter;

const getTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email transport is not configured");
  }
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 465);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port,
      secure: process.env.SMTP_SECURE
        ? process.env.SMTP_SECURE === "true"
        : port === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return transporter;
};

exports.sendEmail = async ({ to, subject, html, text, replyTo }) => {
  if (!to || !subject || (!html && !text)) throw new Error("Invalid email payload");
  return getTransporter().sendMail({
    from: process.env.EMAIL_FROM || `"NAZRA" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text,
    ...(replyTo ? { replyTo } : {})
  });
};

exports._test = { getTransporter };

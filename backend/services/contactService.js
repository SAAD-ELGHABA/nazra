const ContactMessage = require("../models/ContactMessage");
const { sendEmail } = require("../utils/sendEmail");
const { contactNotificationEmail } = require("../emails/contactNotificationEmail");

const resolveNotificationRecipient = () => (
  process.env.CONTACT_EMAIL
  || process.env.ADMIN_EMAIL
  || process.env.SMTP_USER
  || process.env.EMAIL_USER
  || null
);

const submitContactMessage = async (
  contactData,
  {
    ContactMessageModel = ContactMessage,
    sendEmailFn = sendEmail,
    notificationRecipient = resolveNotificationRecipient()
  } = {}
) => {
  const savedMessage = await ContactMessageModel.create({
    ...contactData,
    status: "new",
    source: "contact_page",
    emailNotificationStatus: notificationRecipient ? "pending" : "skipped"
  });

  if (!notificationRecipient) {
    return { savedMessage, notificationStatus: "skipped" };
  }

  const email = contactNotificationEmail(savedMessage);
  let notificationStatus = "sent";
  try {
    await sendEmailFn({
      to: notificationRecipient,
      replyTo: savedMessage.email,
      subject: `Contact NAZRA — ${email.subjectLabel}`,
      html: email.html,
      text: email.text
    });
  } catch (_error) {
    notificationStatus = "failed";
    console.error("Contact message stored but notification email delivery failed");
  }

  try {
    await ContactMessageModel.updateOne(
      { _id: savedMessage._id },
      {
        $set: {
          emailNotificationStatus: notificationStatus,
          emailNotificationAttemptedAt: new Date()
        }
      }
    );
  } catch (_error) {
    console.error("Contact notification status update failed");
  }

  return { savedMessage, notificationStatus };
};

module.exports = { submitContactMessage, resolveNotificationRecipient };

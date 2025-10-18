const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");
require("dotenv").config();

// ✅ Send Email Using MailSender
const sendEmailByMailSender = async ({ email, subject, message }) => {
  try {
    const mailerSend = new MailerSend({
      apiKey: process.env.MAILSENDER_API_KEY, // API Key from .env
    });

    const sentFrom = new Sender("contact@eashaop.com", "Doctor Portal"); 
    const recipients = [new Recipient(email)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(subject)
      .setHtml(message);

    await mailerSend.email.send(emailParams);
    console.log(`Email sent successfully to ${email}`);
  } catch (error) {
    console.error("Email send failed:", error?.response?.body || error.message);
    throw new Error("Email could not be sent", error);
  }
};

module.exports = { sendEmailByMailSender };

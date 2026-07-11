// Helper function to send emails
// We will output to console in development so developers can easily grab links/tokens!
const sendEmail = async ({ email, subject, message, html }) => {
  console.log('========================================================================');
  console.log(`[Email Dispatcher] Sending email to: ${email}`);
  console.log(`[Subject] ${subject}`);
  console.log(`[Body] ${message}`);
  if (html) {
    console.log(`[HTML Body View below]`);
    console.log(html);
  }
  console.log('========================================================================');

  // In production, you would configure nodemailer:
  /*
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  
  await transporter.sendMail({
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: subject,
    text: message,
    html: html
  });
  */

  return true;
};

module.exports = sendEmail;

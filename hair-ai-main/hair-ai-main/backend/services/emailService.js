import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  let transporter;

  // Check if SMTP configurations are present in env
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 2525,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // If not, log to console and simulate successful sending
    console.log('---------------------------------------------------------');
    console.log(`[MOCK EMAIL SENT]`);
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body: ${options.message || 'Attached with PDF'}`);
    if (options.attachments) {
      console.log(`Attachments: ${options.attachments.map(a => a.filename).join(', ')}`);
    }
    console.log('---------------------------------------------------------');
    return { mock: true, success: true };
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || 'HairScope AI <noreply@hairscope-ai.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
    attachments: options.attachments
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Message sent: ${info.messageId}`);
  return info;
};

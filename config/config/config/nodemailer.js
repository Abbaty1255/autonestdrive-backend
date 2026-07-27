const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  logger: true,
  debug: true
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.verify();
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    });

    console.log("EMAIL SENT SUCCESSFULLY");

  } catch (error) {
    console.log("EMAIL ERROR:", error);
  }
};

module.exports = sendEmail;
require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
  console.log("Using email:", process.env.EMAIL_USER);
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    const info = await transporter.sendMail({
      from: `"Backbenchers Portal" <${process.env.EMAIL_USER}>`,
      to: 'shaansingh101206@gmail.com',
      subject: 'Test Notification 2',
      text: 'This is another test notification.'
    });
    console.log("Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Envelope:", info.envelope);
    console.log("Accepted:", info.accepted);
    console.log("Rejected:", info.rejected);
  } catch (err) {
    console.error("Failed to send email:", err);
  }
};

testEmail();

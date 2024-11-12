const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = ({ email, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });

  const messasge = {
    from: "Demo ${process.env.USER}",
    to: email,
    subject,
    html,
  };

  transporter.sendMail(messasge);
};

module.exports = {
  mailSender,
};

import nodemailer from "nodemailer";

export const sendMail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // e.g. "smtp.gmail.com"
    port: process.env.EMAIL_PORT, // 465 for SSL, 587 for TLS
    secure: process.env.EMAIL_PORT === "465", // true if port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"QuickMenu" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

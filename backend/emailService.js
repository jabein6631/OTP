const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use STARTTLS on port 587 (port 465 is blocked on Render)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (toEmail, otp) => {
  await transporter.sendMail({
    from: `"OTP Auth App" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your OTP Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #6366f1; margin-bottom: 8px;">OTP Verification</h2>
        <p style="color: #64748b;">Use the code below to complete your login. It expires in <strong>10 minutes</strong>.</p>
        <div style="font-size: 2.5rem; font-weight: 700; letter-spacing: 0.5rem; color: #1e293b; background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #94a3b8; font-size: 0.85rem;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

module.exports = sendOTPEmail;

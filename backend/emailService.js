const https = require("https");

// Uses Brevo (formerly Sendinblue) HTTP API — works on Render free tier
// SMTP is blocked on Render, but HTTP API is not
const sendOTPEmail = async (toEmail, otp) => {
  const data = JSON.stringify({
    sender: {
      name: process.env.SENDER_NAME || "OTP Auth App",
      email: process.env.SENDER_EMAIL || process.env.EMAIL_USER,
    },
    to: [{ email: toEmail }],
    subject: "Your OTP Verification Code",
    htmlContent: `
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

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.brevo.com",
      path: "/v3/smtp/email",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body);
        } else {
          reject(new Error(`Brevo API error ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
};

module.exports = sendOTPEmail;

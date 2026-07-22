const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendOTPSms = async (toPhone, otp) => {
  await client.messages.create({
    body: `Your OTP verification code is: ${otp}\nValid for 10 minutes. Do not share it with anyone.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: toPhone, // must include country code e.g. +91xxxxxxxxxx
  });
};

module.exports = sendOTPSms;

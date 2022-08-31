// Email

// Notifications

// OTP
export const GenerateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  const otpExpiry = new Date();
  otpExpiry.setMinutes(otpExpiry.getMinutes() + 30);

  return { otp, otpExpiry };
};

export const onRequestOtp = async (otp: number, to: string) => {
  const { twilioCredentials } = require('../config');
  const { ACCOUNT_SID, AUTH_TOKEN, PHONE_NO } = twilioCredentials;

  const twilio = require('twilio');
  const client = new twilio(ACCOUNT_SID, AUTH_TOKEN);

  const response = await client.messages.create({
    body: `Your otp is ${otp}`,
    to: to, // Text this number
    from: PHONE_NO, // From a valid Twilio number
  });

  return response;
};

// Payment Notification

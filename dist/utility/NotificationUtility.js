"use strict";
// Email
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onRequestOtp = exports.GenerateOtp = void 0;
// Notifications
// OTP
const GenerateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 30);
    return { otp, otpExpiry };
};
exports.GenerateOtp = GenerateOtp;
const onRequestOtp = (otp, to) => __awaiter(void 0, void 0, void 0, function* () {
    const { twilioCredentials } = require('../config');
    const { ACCOUNT_SID, AUTH_TOKEN, PHONE_NO } = twilioCredentials;
    const twilio = require('twilio');
    const client = new twilio(ACCOUNT_SID, AUTH_TOKEN);
    const response = yield client.messages.create({
        body: `Your otp is ${otp}`,
        to: to,
        from: PHONE_NO, // From a valid Twilio number
    });
    return response;
});
exports.onRequestOtp = onRequestOtp;
// Payment Notification
//# sourceMappingURL=NotificationUtility.js.map
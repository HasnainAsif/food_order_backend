"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORT = exports.twilioCredentials = exports.APP_SECRET = exports.MONGO_URI = void 0;
exports.MONGO_URI = process.env.MONGO_URI || '';
exports.APP_SECRET = process.env.APP_SECRET || '';
exports.twilioCredentials = {
    ACCOUNT_SID: process.env.ACCOUNT_SID,
    AUTH_TOKEN: process.env.AUTH_TOKEN,
    PHONE_NO: process.env.PHONE_NO,
};
exports.PORT = process.env.PORT || 8000;
//# sourceMappingURL=index.js.map
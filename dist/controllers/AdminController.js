"use strict";
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
exports.GetvendorById = exports.Getvendors = exports.Createvendor = exports.FindVendor = void 0;
const models_1 = require("../models");
const utility_1 = require("../utility");
const FindVendor = (id, email) => __awaiter(void 0, void 0, void 0, function* () {
    if (email) {
        return yield models_1.Vendor.findOne({ email });
    }
    else {
        return yield models_1.Vendor.findById(id);
    }
});
exports.FindVendor = FindVendor;
const Createvendor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, address, email, foodType, ownerName, phone, pincode, password, } = req.body;
    const existingvendor = yield (0, exports.FindVendor)('', email);
    if (existingvendor) {
        return res.json({ message: 'A vendor already exists with this email ID' });
    }
    // Generate a salt
    const salt = yield (0, utility_1.GenerateSalt)();
    // Encrypt password using salt
    const encryptedPassword = yield (0, utility_1.GeneratePassword)(password, salt);
    const createdvendor = yield models_1.Vendor.create({
        name,
        address,
        pincode,
        email,
        foodType,
        password: encryptedPassword,
        salt: salt,
        ownerName,
        phone,
        rating: 0,
        serviceAvailable: false,
        coverImages: [],
    });
    return res.json(createdvendor);
});
exports.Createvendor = Createvendor;
const Getvendors = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const vendors = yield models_1.Vendor.find();
    if (!vendors) {
        return res.json({ message: 'vendors data not available' });
    }
    return res.json(vendors);
});
exports.Getvendors = Getvendors;
const GetvendorById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const vendorId = req.params.id;
    const vendor = yield (0, exports.FindVendor)(vendorId);
    if (!vendor) {
        return res.json({ message: 'vendor data not available' });
    }
    return res.json(vendor);
});
exports.GetvendorById = GetvendorById;
//# sourceMappingURL=AdminController.js.map
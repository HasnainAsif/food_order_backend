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
exports.GetFood = exports.AddFood = exports.UpdatevendorService = exports.UpdatevendorCoverImage = exports.UpdatevendorProfile = exports.GetvendorProfile = exports.vendorLogin = void 0;
const models_1 = require("../models");
const utility_1 = require("../utility");
const AdminController_1 = require("./AdminController");
const vendorLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const existingvendor = yield (0, AdminController_1.Findvendor)('', email);
    if (!existingvendor) {
        return res.json({ message: 'Login credentials not valid' });
    }
    const isMatched = yield (0, utility_1.ValidatePassword)(password, existingvendor.password, existingvendor.salt);
    if (!isMatched) {
        return res.json({ message: 'Password is not valid' });
    }
    const signature = (0, utility_1.GenerateSignature)({
        _id: existingvendor.id,
        email: existingvendor.email,
        foodTypes: existingvendor.foodType,
        name: existingvendor.name,
    });
    return res.json(signature);
});
exports.vendorLogin = vendorLogin;
const GetvendorProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user) {
        return res.json({ message: 'vendor information not found' });
    }
    const existingvendor = yield (0, AdminController_1.Findvendor)(user._id);
    return res.json(existingvendor);
});
exports.GetvendorProfile = GetvendorProfile;
const UpdatevendorProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const notFoundMsg = 'vendor information not found';
    const { name, phone, address, foodType } = req.body;
    const user = req.user;
    if (!user) {
        return res.json({ message: notFoundMsg });
    }
    const existingvendor = yield (0, AdminController_1.Findvendor)(user._id);
    if (!existingvendor) {
        return res.json({ message: notFoundMsg });
    }
    existingvendor.name = name;
    existingvendor.phone = phone;
    existingvendor.address = address;
    existingvendor.foodType = foodType;
    const savedResult = yield existingvendor.save();
    return res.json(savedResult);
});
exports.UpdatevendorProfile = UpdatevendorProfile;
const UpdatevendorCoverImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const notFoundMsg = 'Something went wrong with add food';
    const user = req.user;
    if (!user) {
        return res.json({ message: notFoundMsg });
    }
    const existingvendor = yield (0, AdminController_1.Findvendor)(user._id);
    if (!existingvendor) {
        return res.json({ message: notFoundMsg });
    }
    const files = req.files;
    const images = files.map((file) => file.filename);
    existingvendor.coverImages.push(...images);
    const result = yield existingvendor.save();
    return res.json(result);
});
exports.UpdatevendorCoverImage = UpdatevendorCoverImage;
const UpdatevendorService = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const notFoundMsg = 'vendor information not found';
    const user = req.user;
    if (!user) {
        return res.json({ message: notFoundMsg });
    }
    const existingvendor = yield (0, AdminController_1.Findvendor)(user._id);
    if (!existingvendor) {
        return res.json({ message: notFoundMsg });
    }
    existingvendor.serviceAvailable = !existingvendor.serviceAvailable;
    const savedResult = yield existingvendor.save();
    return res.json(savedResult);
});
exports.UpdatevendorService = UpdatevendorService;
const AddFood = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const notFoundMsg = 'Something went wrong with add food';
    const user = req.user;
    if (!user) {
        return res.json({ message: notFoundMsg });
    }
    const existingvendor = yield (0, AdminController_1.Findvendor)(user._id);
    if (!existingvendor) {
        return res.json({ message: notFoundMsg });
    }
    const files = req.files;
    const images = files.map((file) => file.filename);
    const { name, description, category, foodType, price, readyTime } = req.body;
    const createdFood = yield models_1.Food.create({
        vendorId: existingvendor.id,
        name,
        description,
        category,
        foodType,
        price,
        readyTime,
        images: images,
        rating: 0,
    });
    existingvendor.foods.push(createdFood);
    const result = yield existingvendor.save();
    return res.json(result);
});
exports.AddFood = AddFood;
const GetFood = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const notFoundMsg = 'Foods information not found';
    const user = req.user;
    if (!user) {
        return res.json({ message: notFoundMsg });
    }
    const foods = yield models_1.Food.find({ vendorId: user._id });
    return res.json(foods);
});
exports.GetFood = GetFood;
//# sourceMappingURL=vendorController.js.map
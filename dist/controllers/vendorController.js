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
exports.ProcessOrder = exports.GetOrderDetails = exports.GetVendorOrders = exports.GetFood = exports.AddFood = exports.UpdatevendorService = exports.UpdatevendorCoverImage = exports.UpdatevendorProfile = exports.GetvendorProfile = exports.vendorLogin = void 0;
const models_1 = require("../models");
const Order_1 = require("../models/Order");
const utility_1 = require("../utility");
const AdminController_1 = require("./AdminController");
const vendorLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const existingVendor = yield (0, AdminController_1.FindVendor)('', email);
    if (!existingVendor) {
        return res.json({ message: 'Login credentials not valid' });
    }
    const isMatched = yield (0, utility_1.ValidatePassword)(password, existingVendor.password, existingVendor.salt);
    if (!isMatched) {
        return res.json({ message: 'Password is not valid' });
    }
    const signature = (0, utility_1.GenerateSignature)({
        _id: existingVendor.id,
        email: existingVendor.email,
        foodTypes: existingVendor.foodType,
        name: existingVendor.name,
    });
    return res.json(signature);
});
exports.vendorLogin = vendorLogin;
const GetvendorProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user) {
        return res.json({ message: 'vendor information not found' });
    }
    const existingVendor = yield (0, AdminController_1.FindVendor)(user._id);
    return res.json(existingVendor);
});
exports.GetvendorProfile = GetvendorProfile;
const UpdatevendorProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const notFoundMsg = 'vendor information not found';
    const { name, phone, address, foodType } = req.body;
    const user = req.user;
    if (!user) {
        return res.json({ message: notFoundMsg });
    }
    const existingVendor = yield (0, AdminController_1.FindVendor)(user._id);
    if (!existingVendor) {
        return res.json({ message: notFoundMsg });
    }
    existingVendor.name = name;
    existingVendor.phone = phone;
    existingVendor.address = address;
    existingVendor.foodType = foodType;
    const savedResult = yield existingVendor.save();
    return res.json(savedResult);
});
exports.UpdatevendorProfile = UpdatevendorProfile;
const UpdatevendorCoverImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const notFoundMsg = 'Something went wrong with add food';
    const user = req.user;
    if (!user) {
        return res.json({ message: notFoundMsg });
    }
    const existingVendor = yield (0, AdminController_1.FindVendor)(user._id);
    if (!existingVendor) {
        return res.json({ message: notFoundMsg });
    }
    const files = req.files;
    const images = files.map((file) => file.filename);
    existingVendor.coverImages.push(...images);
    const result = yield existingVendor.save();
    return res.json(result);
});
exports.UpdatevendorCoverImage = UpdatevendorCoverImage;
const UpdatevendorService = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const notFoundMsg = 'vendor information not found';
    const user = req.user;
    if (!user) {
        return res.json({ message: notFoundMsg });
    }
    const existingVendor = yield (0, AdminController_1.FindVendor)(user._id);
    if (!existingVendor) {
        return res.json({ message: notFoundMsg });
    }
    existingVendor.serviceAvailable = !existingVendor.serviceAvailable;
    const savedResult = yield existingVendor.save();
    return res.json(savedResult);
});
exports.UpdatevendorService = UpdatevendorService;
const AddFood = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const notFoundMsg = 'Something went wrong with add food';
    const user = req.user;
    if (!user) {
        return res.json({ message: notFoundMsg });
    }
    const existingVendor = yield (0, AdminController_1.FindVendor)(user._id);
    if (!existingVendor) {
        return res.json({ message: notFoundMsg });
    }
    const files = req.files;
    const images = files.map((file) => file.filename);
    const { name, description, category, foodType, price, readyTime } = req.body;
    const createdFood = yield models_1.Food.create({
        vendorId: existingVendor.id,
        name,
        description,
        category,
        foodType,
        price,
        readyTime,
        images: images,
        rating: 0,
    });
    existingVendor.foods.push(createdFood);
    const result = yield existingVendor.save();
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
const GetVendorOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user) {
        return res.status(404).json({ message: 'Vendor not found' });
    }
    const orders = yield Order_1.Order.find({ vendorId: user._id }).populate('items.food');
    if (!orders || orders.length === 0) {
        return res.status(404).json({ message: 'No order found' });
    }
    return res.status(200).json(orders);
});
exports.GetVendorOrders = GetVendorOrders;
const GetOrderDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: orderId } = req.params;
    const vendor = req.user;
    const order = yield Order_1.Order.findOne({
        _id: orderId,
        vendorId: vendor._id,
    }).populate('items.food');
    if (!order) {
        return res.status(404).json({ message: 'No order found' });
    }
    return res.status(200).json(order);
});
exports.GetOrderDetails = GetOrderDetails;
const ProcessOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //
});
exports.ProcessOrder = ProcessOrder;
//# sourceMappingURL=vendorController.js.map
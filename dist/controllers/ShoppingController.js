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
exports.RestaurantById = exports.SearchFoods = exports.GetFoodsIn30Mins = exports.GetTopRestaurants = exports.GetFoodAvailability = void 0;
const models_1 = require("../models");
const GetFoodAvailability = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const pincode = req.params.pincode;
    const vendors = yield models_1.Vendor.find({ pincode, serviceAvailable: true })
        .sort({ rating: 'descending' })
        .populate('foods');
    if ((vendors === null || vendors === void 0 ? void 0 : vendors.length) <= 0) {
        return res.status(404).json({ message: 'Data not found!' });
    }
    return res.status(200).json(vendors);
});
exports.GetFoodAvailability = GetFoodAvailability;
const GetTopRestaurants = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const pincode = req.params.pincode;
    const vendors = yield models_1.Vendor.find({ pincode, serviceAvailable: true })
        .sort({ rating: 'descending' })
        .limit(10);
    if ((vendors === null || vendors === void 0 ? void 0 : vendors.length) <= 0) {
        return res.status(404).json({ message: 'Data not found!' });
    }
    return res.status(200).json(vendors);
});
exports.GetTopRestaurants = GetTopRestaurants;
const GetFoodsIn30Mins = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const pincode = req.params.pincode;
    const vendors = yield models_1.Vendor.find({
        pincode,
        serviceAvailable: true,
    }).populate('foods');
    if ((vendors === null || vendors === void 0 ? void 0 : vendors.length) <= 0) {
        return res.status(404).json({ message: 'Data not found!' });
    }
    let foodResult = [];
    vendors.map((vendor) => {
        const foods = vendor.foods;
        foodResult.push(...foods.filter((food) => food.readyTime <= 30));
    });
    return res.status(200).json(foodResult);
});
exports.GetFoodsIn30Mins = GetFoodsIn30Mins;
const SearchFoods = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const pincode = req.params.pincode;
    const vendors = yield models_1.Vendor.find({
        pincode,
        serviceAvailable: true,
    }).populate('foods');
    if ((vendors === null || vendors === void 0 ? void 0 : vendors.length) <= 0) {
        return res.status(404).json({ message: 'Data not found!' });
    }
    let foodResult = [];
    vendors.map((vendor) => foodResult.push(...vendor.foods));
    return res.status(200).json(foodResult);
});
exports.SearchFoods = SearchFoods;
const RestaurantById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const vendor = yield models_1.Vendor.findById(id).populate('foods');
    if (!vendor) {
        return res.status(404).json({ message: 'Data not found!' });
    }
    return res.status(200).json(vendor);
});
exports.RestaurantById = RestaurantById;
//# sourceMappingURL=ShoppingController.js.map
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
exports.GetOrderById = exports.GetOrders = exports.CreateOrder = exports.DeleteCart = exports.GetCart = exports.AddToCart = exports.EditCustomerProfile = exports.GetCustomerProfile = exports.RequestOtp = exports.CustomerVerify = exports.CustomerLogin = exports.CustomerSignup = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const Customer_dto_1 = require("../dto/Customer.dto");
const models_1 = require("../models");
const Order_1 = require("../models/Order");
const utility_1 = require("../utility");
/** ------------------------ Profile Section ---------------------------------- **/
const CustomerSignup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customerInputs = (0, class_transformer_1.plainToClass)(Customer_dto_1.CreateCustomerInputs, req.body);
    const inputErrors = yield (0, class_validator_1.validate)(customerInputs, {
        validationError: { target: false },
    });
    if (inputErrors.length > 0) {
        return res.status(400).json(inputErrors);
    }
    const { email, phone, password } = customerInputs;
    const existingCustomer = yield models_1.Customer.findOne({ email });
    if (existingCustomer) {
        /* -----------My solution Starts From Here------------ */
        // if customer is already verified send an error message
        // send otp to customer
        // generate the signature
        // send result to client
        /* -----------My solution Ends Here------------ */
        return res
            .status(404)
            .json({ message: 'A user already exists with same email' });
    }
    const salt = yield (0, utility_1.GenerateSalt)();
    const userPassword = yield (0, utility_1.GeneratePassword)(password, salt);
    const { otp, otpExpiry } = (0, utility_1.GenerateOtp)();
    const result = yield models_1.Customer.create({
        email,
        password: userPassword,
        salt,
        otp,
        otpExpiry,
        phone,
        firstName: '',
        lastName: '',
        address: '',
        verified: false,
        lat: 0,
        lng: 0,
        orders: [],
    });
    if (!result) {
        return res.status(400).json({ message: 'Error with Signup' });
    }
    // send otp to customer
    // await onRequestOtp(otp, phone);
    console.log(otp); // for avoid calling twilio api
    // generate the signature
    const signature = (0, utility_1.GenerateSignature)({
        _id: result._id,
        email: result.email,
        verified: result.verified,
    });
    // send result to client
    return res
        .status(201)
        .json({ signature, verified: result.verified, email: result.email });
});
exports.CustomerSignup = CustomerSignup;
const CustomerLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customerInputs = (0, class_transformer_1.plainToClass)(Customer_dto_1.CustomerloginInputs, req.body);
    const inputErrors = yield (0, class_validator_1.validate)(customerInputs, {
        validationError: { target: false },
    });
    if (inputErrors.length > 0) {
        return res.status(400).json(inputErrors);
    }
    const { email, password } = customerInputs;
    const existingCustomer = yield models_1.Customer.findOne({ email });
    if (!existingCustomer) {
        return res
            .status(404)
            .json({ message: 'Customer not found with this email' });
    }
    if (!existingCustomer.verified) {
        return res.status(400).json({ message: 'Email is not verified yet' });
    }
    const isMatched = (0, utility_1.ValidatePassword)(password, existingCustomer.password, existingCustomer.salt);
    if (!isMatched) {
        return res.json({ message: 'Password is not valid' });
    }
    const signature = (0, utility_1.GenerateSignature)({
        _id: existingCustomer.id,
        email: existingCustomer.email,
        verified: existingCustomer.verified,
    });
    return res.status(200).json({
        signature,
        email: existingCustomer.email,
        verified: existingCustomer.verified,
    });
});
exports.CustomerLogin = CustomerLogin;
const CustomerVerify = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp } = req.body;
    const customer = req.user;
    if (!customer) {
        return res.status(400).json({ message: 'Error with OTP validation' });
    }
    const existingCustomer = yield models_1.Customer.findById(customer._id);
    if (!existingCustomer) {
        return res.status(404).json({ message: 'Customer not found' }); // or: "Error with OTP validation"
    }
    if (existingCustomer.verified) {
        return res.status(409).json({ message: 'Customer already verified' });
    }
    if ((existingCustomer === null || existingCustomer === void 0 ? void 0 : existingCustomer.otp) !== parseInt(otp) ||
        existingCustomer.otpExpiry <= new Date()) {
        return res.status(400).send({ message: 'Error with OTP validation' }); // or: 'Provided otp is invalid'
    }
    existingCustomer.verified = true;
    existingCustomer.otp = 0;
    const updatedCustomer = yield existingCustomer.save();
    // generate the signature
    const signature = (0, utility_1.GenerateSignature)({
        _id: updatedCustomer._id,
        email: updatedCustomer.email,
        verified: updatedCustomer.verified,
    });
    // send result to client
    return res.status(201).json({
        signature,
        verified: updatedCustomer.verified,
        email: updatedCustomer.email,
    });
});
exports.CustomerVerify = CustomerVerify;
const RequestOtp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    if (!customer) {
        return res.status(400).json({ message: 'Error in requesting OTP' });
    }
    const existingCustomer = yield models_1.Customer.findById(customer._id);
    if (!existingCustomer) {
        return res.status(404).json({ message: 'Customer not found' }); // or: 'Error in requesting OTP'
    }
    if (existingCustomer.verified) {
        return res.status(409).json({ message: 'Email is already verified' });
    }
    // Generate Otp
    const { otp, otpExpiry } = (0, utility_1.GenerateOtp)();
    // save otp and otpExpiry to database
    existingCustomer.otp = otp;
    existingCustomer.otpExpiry = otpExpiry;
    yield existingCustomer.save();
    // send otp to customer
    // await onRequestOtp(otp, existingCustomer.phone);
    console.log(otp); // for avoid calling twilio api
    return res
        .status(200)
        .json({ message: 'Otp sent to your registered phone number' });
});
exports.RequestOtp = RequestOtp;
const GetCustomerProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    if (!customer) {
        return res.status(404).json({ message: 'Customer Profile not found' });
    }
    const existingCustomer = yield models_1.Customer.findById(customer._id);
    if (!existingCustomer) {
        return res.status(404).json({ message: 'Customer profile not found' });
    }
    return res.status(200).json(existingCustomer);
});
exports.GetCustomerProfile = GetCustomerProfile;
const EditCustomerProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    const customerInputs = (0, class_transformer_1.plainToClass)(Customer_dto_1.EditCustomerProfileInputs, req.body);
    const inputErrors = yield (0, class_validator_1.validate)(customerInputs, {
        validationError: { target: false },
    });
    if (inputErrors.length > 0) {
        return res.status(400).json(inputErrors);
    }
    const { firstName, lastName, address } = customerInputs;
    if (!customer) {
        return res.status(404).json({ message: 'Customer Profile not found' });
    }
    const existingCustomer = yield models_1.Customer.findById(customer._id);
    if (!existingCustomer) {
        return res.status(404).json({ message: 'Customer profile not found' });
    }
    if (!existingCustomer.verified) {
        return res.status(400).json({ message: 'Customer email not verified yet' });
    }
    existingCustomer.firstName = firstName;
    existingCustomer.lastName = lastName;
    existingCustomer.address = address;
    const result = yield existingCustomer.save();
    return res.status(200).json(result);
});
exports.EditCustomerProfile = EditCustomerProfile;
/** ------------------------ Cart Section ---------------------------------- **/
const AddToCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // check: Food with different vendors must not be added on cart - TODO
    const customer = req.user;
    if (!customer) {
        // in my opinion, its useless error. Because it should be handled in Authorization middleware
        return res.status(401).json({ message: 'Customer not loggedin yet' });
    }
    const existingCustomer = yield models_1.Customer.findById(customer._id).populate('cart.food');
    if (!existingCustomer) {
        return res.status(404).json({ message: 'Customer detail not found' });
    }
    let existingCartItems = [];
    const { id, unit } = req.body; // "id" is Food_id, "unit" is quantity of food
    const food = yield models_1.Food.findById(id);
    if (!food) {
        return res.status(400).json({ message: 'Provided food is invalid' });
    }
    existingCartItems = existingCustomer.cart;
    // if no item exists in customers cart
    if (existingCartItems.length === 0) {
        existingCartItems.push({ food, unit });
    }
    else {
        // check and update unit
        const matchedCartItem = existingCartItems.find((existingCartItem) => existingCartItem.food._id.toString() === id);
        if (!matchedCartItem) {
            // add check, if unit is zero - TODO
            // item not exist in customer cart
            existingCartItems.push({ food, unit });
        }
        else {
            // payload cart item exists in customer cart
            if (unit > 0) {
                // update payload units of cart item in customer cart
                matchedCartItem.unit = unit;
            }
            else {
                // payload unit less than or equal to "zero", delete cart item from customer cart(existingCartItems)
                const matchedCartItemIdx = existingCartItems.indexOf(matchedCartItem);
                existingCartItems.splice(matchedCartItemIdx, 1);
            }
        }
    }
    existingCustomer.cart = existingCartItems;
    const result = yield existingCustomer.save();
    return res.status(200).json(result.cart);
});
exports.AddToCart = AddToCart;
const GetCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    if (!customer) {
        // in my opinion, its useless error. Because it should be handled in Authorization middleware
        return res.status(404).json({ message: 'Customer not loggedin yet' }); // Cart is empty
    }
    const existingCustomer = yield models_1.Customer.findById(customer._id).populate('cart.food');
    if (!existingCustomer) {
        return res.status(400).json({ message: 'Cart is empty' });
    }
    return res.status(200).json(existingCustomer.cart);
});
exports.GetCart = GetCart;
const DeleteCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    if (!customer) {
        // in my opinion, its useless error. Because it should be handled in Authorization middleware
        return res.status(404).json({ message: 'Customer not loggedin yet' }); // Cart is empty
    }
    const existingCustomer = yield models_1.Customer.findById(customer._id).populate('cart.food');
    if (!existingCustomer) {
        return res.status(400).json({ message: 'Cart is already empty' });
    }
    existingCustomer.cart = [];
    const updatedCustomer = yield existingCustomer.save();
    return res.status(200).json(updatedCustomer);
});
exports.DeleteCart = DeleteCart;
/** ------------------------ Order Section ---------------------------------- **/
const CreateOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Grab current login customer
    const customer = req.user;
    if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
    }
    // Create an Order ID
    const orderId = `${Math.floor(Math.random() * 89999 + 1000)}`;
    const existingCustomer = yield models_1.Customer.findById(customer._id);
    // Grab order items from request [ { id: XX, unit: XX } ]
    const cart = req.body; // [ { id: XX, unit: XX } ] // "id" is Food_id, "unit" is quantity of food
    let cartItems = Array();
    let netAmount = 0;
    // Calculate an Order amount
    const foods = yield models_1.Food.find()
        .where('_id')
        .in(cart.map((item) => item.id))
        .exec();
    if (foods.length === 0) {
        return res.status(404).json({ message: 'No food found with provided ids' });
    }
    for (let i = 0; i < foods.length - 1; i++) {
        const prev = foods[i];
        const current = foods[i + 1];
        if (prev.vendorId.toString() !== current.vendorId.toString()) {
            return res.status(400).json({
                message: 'Foods from different vendors cannot be in same order',
            });
        }
    }
    foods.map((food) => {
        const { id, unit } = cart.find(({ id }) => food.id === id);
        netAmount += food.price * unit;
        cartItems.push({ food, unit });
    });
    // Create order with items description
    if (cartItems.length <= 0) {
        return res.status(400).json({});
    }
    // Create Order
    const currentOrder = yield Order_1.Order.create({
        customerId: customer._id,
        vendorId: foods[0].vendorId,
        orderId,
        items: cartItems,
        totalAmount: netAmount,
        orderDate: new Date(),
        paidThrough: 'COD',
        paymentResponse: '',
        orderStatus: 'Waiting',
    });
    // Finally update orders to customer account
    existingCustomer.orders.push(currentOrder);
    yield existingCustomer.save();
    return res.status(200).json(currentOrder);
});
exports.CreateOrder = CreateOrder;
const GetOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    const existingCustomer = yield models_1.Customer.findById(customer._id).populate('orders');
    if (!existingCustomer) {
        return res.status(404).json({ message: 'No customer found' });
    }
    return res.status(200).json(existingCustomer.orders);
});
exports.GetOrders = GetOrders;
const GetOrderById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'Order Id is required' });
    }
    const existingOrder = yield Order_1.Order.findOne({
        _id: id,
        customerId: customer._id,
    });
    if (!existingOrder) {
        return res.status(404).json({ message: 'No order found' });
    }
    return res.status(200).json(existingOrder);
});
exports.GetOrderById = GetOrderById;
//# sourceMappingURL=CustomerController.js.map
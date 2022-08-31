import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import {
  CartItem,
  CreateCustomerInputs,
  CustomerloginInputs,
  CustomerPayload,
  EditCustomerProfileInputs,
  OrderInputs,
} from '../dto/Customer.dto';
import { Customer, Food, FoodDoc } from '../models';
import { Order } from '../models/Order';
import {
  GenerateOtp,
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  onRequestOtp,
  ValidatePassword,
} from '../utility';

/** ------------------------ Profile Section ---------------------------------- **/

export const CustomerSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customerInputs = plainToClass(CreateCustomerInputs, req.body);
  const inputErrors = await validate(customerInputs, {
    validationError: { target: false },
  });

  if (inputErrors.length > 0) {
    return res.status(400).json(inputErrors);
  }

  const { email, phone, password } = customerInputs;

  const existingCustomer = await Customer.findOne({ email });
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

  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);

  const { otp, otpExpiry } = GenerateOtp();

  const result = await Customer.create({
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
  const signature = GenerateSignature({
    _id: result._id,
    email: result.email,
    verified: result.verified,
  });

  // send result to client
  return res
    .status(201)
    .json({ signature, verified: result.verified, email: result.email });
};

export const CustomerLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customerInputs = plainToClass(CustomerloginInputs, req.body);
  const inputErrors = await validate(customerInputs, {
    validationError: { target: false },
  });

  if (inputErrors.length > 0) {
    return res.status(400).json(inputErrors);
  }

  const { email, password } = customerInputs;

  const existingCustomer = await Customer.findOne({ email });
  if (!existingCustomer) {
    return res
      .status(404)
      .json({ message: 'Customer not found with this email' });
  }

  if (!existingCustomer.verified) {
    return res.status(400).json({ message: 'Email is not verified yet' });
  }

  const isMatched = ValidatePassword(
    password,
    existingCustomer.password,
    existingCustomer.salt
  );
  if (!isMatched) {
    return res.json({ message: 'Password is not valid' });
  }

  const signature = GenerateSignature({
    _id: existingCustomer.id,
    email: existingCustomer.email,
    verified: existingCustomer.verified,
  });

  return res.status(200).json({
    signature,
    email: existingCustomer.email,
    verified: existingCustomer.verified,
  });
};

export const CustomerVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { otp } = req.body;
  const customer = req.user;

  if (!customer) {
    return res.status(400).json({ message: 'Error with OTP validation' });
  }

  const existingCustomer = await Customer.findById(customer._id);

  if (!existingCustomer) {
    return res.status(404).json({ message: 'Customer not found' }); // or: "Error with OTP validation"
  }

  if (existingCustomer.verified) {
    return res.status(409).json({ message: 'Customer already verified' });
  }

  if (
    existingCustomer?.otp !== parseInt(otp) ||
    existingCustomer.otpExpiry <= new Date()
  ) {
    return res.status(400).send({ message: 'Error with OTP validation' }); // or: 'Provided otp is invalid'
  }

  existingCustomer.verified = true;
  existingCustomer.otp = 0;
  const updatedCustomer = await existingCustomer.save();

  // generate the signature
  const signature = GenerateSignature({
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
};

export const RequestOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (!customer) {
    return res.status(400).json({ message: 'Error in requesting OTP' });
  }

  const existingCustomer = await Customer.findById(customer._id);

  if (!existingCustomer) {
    return res.status(404).json({ message: 'Customer not found' }); // or: 'Error in requesting OTP'
  }

  if (existingCustomer.verified) {
    return res.status(409).json({ message: 'Email is already verified' });
  }

  // Generate Otp
  const { otp, otpExpiry } = GenerateOtp();

  // save otp and otpExpiry to database
  existingCustomer.otp = otp;
  existingCustomer.otpExpiry = otpExpiry;
  await existingCustomer.save();

  // send otp to customer
  // await onRequestOtp(otp, existingCustomer.phone);

  console.log(otp); // for avoid calling twilio api

  return res
    .status(200)
    .json({ message: 'Otp sent to your registered phone number' });
};

export const GetCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (!customer) {
    return res.status(404).json({ message: 'Customer Profile not found' });
  }

  const existingCustomer = await Customer.findById(customer._id);

  if (!existingCustomer) {
    return res.status(404).json({ message: 'Customer profile not found' });
  }

  return res.status(200).json(existingCustomer);
};

export const EditCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  const customerInputs = plainToClass(EditCustomerProfileInputs, req.body);
  const inputErrors = await validate(customerInputs, {
    validationError: { target: false },
  });

  if (inputErrors.length > 0) {
    return res.status(400).json(inputErrors);
  }

  const { firstName, lastName, address } = customerInputs;

  if (!customer) {
    return res.status(404).json({ message: 'Customer Profile not found' });
  }

  const existingCustomer = await Customer.findById(customer._id);

  if (!existingCustomer) {
    return res.status(404).json({ message: 'Customer profile not found' });
  }

  if (!existingCustomer.verified) {
    return res.status(400).json({ message: 'Customer email not verified yet' });
  }

  existingCustomer.firstName = firstName;
  existingCustomer.lastName = lastName;
  existingCustomer.address = address;
  const result = await existingCustomer.save();

  return res.status(200).json(result);
};

/** ------------------------ Cart Section ---------------------------------- **/

export const AddToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // check: Food with different vendors must not be added on cart - TODO

  const customer = req.user as CustomerPayload;

  if (!customer) {
    // in my opinion, its useless error. Because it should be handled in Authorization middleware
    return res.status(401).json({ message: 'Customer not loggedin yet' });
  }

  const existingCustomer = await Customer.findById(customer._id).populate(
    'cart.food'
  );
  if (!existingCustomer) {
    return res.status(404).json({ message: 'Customer detail not found' });
  }

  let existingCartItems = [] as CartItem[];

  const { id, unit } = <OrderInputs>req.body; // "id" is Food_id, "unit" is quantity of food

  const food = await Food.findById(id);
  if (!food) {
    return res.status(400).json({ message: 'Provided food is invalid' });
  }

  existingCartItems = existingCustomer.cart;

  // if no item exists in customers cart
  if (existingCartItems.length === 0) {
    existingCartItems.push({ food, unit });
  } else {
    // check and update unit
    const matchedCartItem = existingCartItems.find(
      (existingCartItem) => existingCartItem.food._id.toString() === id
    );

    if (!matchedCartItem) {
      // add check, if unit is zero - TODO

      // item not exist in customer cart

      existingCartItems.push({ food, unit });
    } else {
      // payload cart item exists in customer cart

      if (unit > 0) {
        // update payload units of cart item in customer cart
        matchedCartItem.unit = unit;
      } else {
        // payload unit less than or equal to "zero", delete cart item from customer cart(existingCartItems)

        const matchedCartItemIdx = existingCartItems.indexOf(matchedCartItem);
        existingCartItems.splice(matchedCartItemIdx, 1);
      }
    }
  }

  existingCustomer.cart = existingCartItems;
  const result = await existingCustomer.save();
  return res.status(200).json(result.cart);
};

export const GetCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user as CustomerPayload;

  if (!customer) {
    // in my opinion, its useless error. Because it should be handled in Authorization middleware
    return res.status(404).json({ message: 'Customer not loggedin yet' }); // Cart is empty
  }

  const existingCustomer = await Customer.findById(customer._id).populate(
    'cart.food'
  );
  if (!existingCustomer) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  return res.status(200).json(existingCustomer.cart);
};

export const DeleteCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user as CustomerPayload;

  if (!customer) {
    // in my opinion, its useless error. Because it should be handled in Authorization middleware
    return res.status(404).json({ message: 'Customer not loggedin yet' }); // Cart is empty
  }

  const existingCustomer = await Customer.findById(customer._id).populate(
    'cart.food'
  );
  if (!existingCustomer) {
    return res.status(400).json({ message: 'Cart is already empty' });
  }

  existingCustomer.cart = [] as CartItem[];
  const updatedCustomer = await existingCustomer.save();

  return res.status(200).json(updatedCustomer);
};

/** ------------------------ Order Section ---------------------------------- **/

export const CreateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Grab current login customer
  const customer = req.user;

  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }

  // Create an Order ID
  const orderId = `${Math.floor(Math.random() * 89999 + 1000)}`;

  const existingCustomer = await Customer.findById(customer._id);

  // Grab order items from request [ { id: XX, unit: XX } ]
  const cart = <[OrderInputs]>req.body; // [ { id: XX, unit: XX } ] // "id" is Food_id, "unit" is quantity of food

  let cartItems = Array();
  let netAmount = 0;

  // Calculate an Order amount
  const foods = await Food.find()
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
  const currentOrder = await Order.create({
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
  await existingCustomer.save();

  return res.status(200).json(currentOrder);
};

export const GetOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  const existingCustomer = await Customer.findById(customer._id).populate(
    'orders'
  );
  if (!existingCustomer) {
    return res.status(404).json({ message: 'No customer found' });
  }

  return res.status(200).json(existingCustomer.orders);
};

export const GetOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Order Id is required' });
  }

  const existingOrder = await Order.findOne({
    _id: id,
    customerId: customer._id,
  });
  if (!existingOrder) {
    return res.status(404).json({ message: 'No order found' });
  }

  return res.status(200).json(existingOrder);
};

import { Request, Response, NextFunction } from 'express';
import { EditVendorInput, VendorLoginInput, VendorPayload } from '../dto';
import { CreateFoodInput } from '../dto/Food.dto';
import { Vendor, Food } from '../models';
import { Order } from '../models/Order';
import { GenerateSignature, ValidatePassword } from '../utility';
import { FindVendor } from './AdminController';

export const vendorLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = <VendorLoginInput>req.body;

  const existingVendor = await FindVendor('', email);
  if (!existingVendor) {
    return res.json({ message: 'Login credentials not valid' });
  }

  const isMatched = await ValidatePassword(
    password,
    existingVendor.password,
    existingVendor.salt
  );
  if (!isMatched) {
    return res.json({ message: 'Password is not valid' });
  }

  const signature = GenerateSignature({
    _id: existingVendor.id,
    email: existingVendor.email,
    foodTypes: existingVendor.foodType,
    name: existingVendor.name,
  });

  return res.json(signature);
};

export const GetvendorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (!user) {
    return res.json({ message: 'vendor information not found' });
  }

  const existingVendor = await FindVendor(user._id);
  return res.json(existingVendor);
};

export const UpdatevendorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const notFoundMsg = 'vendor information not found';

  const { name, phone, address, foodType } = <EditVendorInput>req.body;

  const user = req.user;
  if (!user) {
    return res.json({ message: notFoundMsg });
  }

  const existingVendor = await FindVendor(user._id);
  if (!existingVendor) {
    return res.json({ message: notFoundMsg });
  }

  existingVendor.name = name;
  existingVendor.phone = phone;
  existingVendor.address = address;
  existingVendor.foodType = foodType;

  const savedResult = await existingVendor.save();
  return res.json(savedResult);
};

export const UpdatevendorCoverImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const notFoundMsg = 'Something went wrong with add food';

  const user = req.user;
  if (!user) {
    return res.json({ message: notFoundMsg });
  }

  const existingVendor = await FindVendor(user._id);
  if (!existingVendor) {
    return res.json({ message: notFoundMsg });
  }

  const files = req.files as [Express.Multer.File];
  const images = files.map((file: Express.Multer.File) => file.filename);

  existingVendor.coverImages.push(...images);
  const result = await existingVendor.save();

  return res.json(result);
};

export const UpdatevendorService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const notFoundMsg = 'vendor information not found';

  const user = req.user;
  if (!user) {
    return res.json({ message: notFoundMsg });
  }

  const existingVendor = await FindVendor(user._id);
  if (!existingVendor) {
    return res.json({ message: notFoundMsg });
  }

  existingVendor.serviceAvailable = !existingVendor.serviceAvailable;

  const savedResult = await existingVendor.save();
  return res.json(savedResult);
};

export const AddFood = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const notFoundMsg = 'Something went wrong with add food';

  const user = req.user;
  if (!user) {
    return res.json({ message: notFoundMsg });
  }

  const existingVendor = await FindVendor(user._id);
  if (!existingVendor) {
    return res.json({ message: notFoundMsg });
  }

  const files = req.files as [Express.Multer.File];
  const images = files.map((file: Express.Multer.File) => file.filename);

  const { name, description, category, foodType, price, readyTime } = <
    CreateFoodInput
  >req.body;

  const createdFood = await Food.create({
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
  const result = await existingVendor.save();

  return res.json(result);
};

export const GetFood = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const notFoundMsg = 'Foods information not found';

  const user = req.user;
  if (!user) {
    return res.json({ message: notFoundMsg });
  }

  const foods = await Food.find({ vendorId: user._id });
  return res.json(foods);
};

export const GetVendorOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as VendorPayload;

  if (!user) {
    return res.status(404).json({ message: 'Vendor not found' });
  }

  const orders = await Order.find({ vendorId: user._id }).populate(
    'items.food'
  );

  if (!orders || orders.length === 0) {
    return res.status(404).json({ message: 'No order found' });
  }

  return res.status(200).json(orders);
};

export const GetOrderDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id: orderId } = req.params;
  const vendor = req.user as VendorPayload;

  const order = await Order.findOne({
    _id: orderId,
    vendorId: vendor._id,
  }).populate('items.food');

  if (!order) {
    return res.status(404).json({ message: 'No order found' });
  }

  return res.status(200).json(order);
};

export const ProcessOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //
};

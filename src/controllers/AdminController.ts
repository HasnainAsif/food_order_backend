import { Request, Response, NextFunction } from 'express';
import { CreateVendorInput } from '../dto';
import { Vendor } from '../models';
import { GeneratePassword, GenerateSalt } from '../utility';

export const FindVendor = async (id: string | undefined, email?: string) => {
  if (email) {
    return await Vendor.findOne({ email });
  } else {
    return await Vendor.findById(id);
  }
};

export const Createvendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    name,
    address,
    email,
    foodType,
    ownerName,
    phone,
    pincode,
    password,
  } = <CreateVendorInput>req.body;

  const existingvendor = await FindVendor('', email);

  if (existingvendor) {
    return res.json({ message: 'A vendor already exists with this email ID' });
  }

  // Generate a salt
  const salt = await GenerateSalt();
  // Encrypt password using salt
  const encryptedPassword = await GeneratePassword(password, salt);

  const createdvendor = await Vendor.create({
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
};

export const Getvendors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const vendors = await Vendor.find();

  if (!vendors) {
    return res.json({ message: 'vendors data not available' });
  }

  return res.json(vendors);
};

export const GetvendorById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const vendorId = req.params.id;
  const vendor = await FindVendor(vendorId);

  if (!vendor) {
    return res.json({ message: 'vendor data not available' });
  }

  return res.json(vendor);
};

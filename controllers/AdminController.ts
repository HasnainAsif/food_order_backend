import express, { Request, Response, NextFunction } from 'express';
import { createVandorInput } from '../dto';
import { Vandor } from '../models';
import { generatePassword, generateSalt } from '../utility';

const router = express.Router();

export const createVandor = async (
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
  } = <createVandorInput>req.body;

  const existingVandor = await Vandor.findOne({ email });
  if (existingVandor) {
    return res.json({ message: 'A vandor already exists with this email ID' });
  }

  // Generate a salt
  const salt = await generateSalt();
  // Encrypt password using salt
  const encryptedPassword = await generatePassword(password, salt);

  const createdVandor = await Vandor.create({
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

  return res.json(createdVandor);
};

export const getVandors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //
  res.json({ message: 'Vandors' });
};

export const getVandorById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //
  res.json({ message: 'Vandor detail' });
};

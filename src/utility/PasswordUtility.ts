import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { APP_SECRET } from '../config';
import { Request } from 'express';
import { AuthPayload } from '../dto/Auth.dto';

export const GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

export const GeneratePassword = async (password: string, salt: string) => {
  return await bcrypt.hash(password, salt);
};

export const ValidatePassword = async (
  enteredPassword: string,
  savedPassword: string,
  salt: string
) => {
  return await bcrypt.compare(enteredPassword, savedPassword);
  // return (await GeneratePassword(enteredPassword, salt)) === savedPassword;
};

export const GenerateSignature = (payload: AuthPayload) => {
  return jwt.sign(payload, APP_SECRET, { expiresIn: '1d' });
};

export const ValidateSignature = (req: Request) => {
  const signature = req.get('Authorization');
  if (!signature) {
    return false;
  }

  const payload = jwt.verify(
    signature?.split(' ')[1],
    APP_SECRET
  ) as AuthPayload;

  req.user = payload;

  return true;
};

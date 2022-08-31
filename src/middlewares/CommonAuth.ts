import { NextFunction, Request, Response } from 'express';
import { AuthPayload } from '../dto/Auth.dto';
import { ValidateSignature } from '../utility';

// add user key into Request interface(type)
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const Authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validate = ValidateSignature(req);
  if (!validate) {
    return res.status(401).json({ message: 'User not Authorized' });
  }

  // handle token expiration

  next();
};

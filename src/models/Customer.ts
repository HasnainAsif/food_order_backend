import mongoose, { Document, Schema } from 'mongoose';
import { CartItem } from '../dto';
import { OrderDoc } from './Order';

interface CustomerDoc extends Document {
  email: string;
  password: string;
  salt: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  verified: boolean;
  otp: number;
  otpExpiry: Date;
  lat: number;
  lng: number;
  cart: CartItem[];
  orders: [OrderDoc];
}

const CustomerSchema = new Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    address: { type: String },
    phone: { type: String, required: true },
    verified: { type: Boolean, required: true },
    otp: { type: Number, required: true },
    otpExpiry: { type: Date, required: true },
    lat: { type: Number },
    lng: { type: Number },
    cart: [
      {
        food: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: 'food',
          required: true,
        },
        unit: { type: Number, required: true },
      },
    ],
    orders: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'order',
      },
    ],
  },
  {
    toJSON: {
      transform(doc, ret, options) {
        delete ret.password;
        delete ret.salt;
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
    timestamps: true,
  }
);

const Customer = mongoose.model<CustomerDoc>('customer', CustomerSchema);

export { Customer };

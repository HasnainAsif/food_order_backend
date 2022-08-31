import mongoose, { Document, Schema } from 'mongoose';
import { CartItem } from '../dto';

export interface OrderDoc extends Document {
  orderId: string; // 5948764 - a readable id for customer to check its order details
  vendorId: string;
  customerId: string;
  items: CartItem[]; // [{ food, unit: 1 }]
  totalAmount: number; // 390
  orderDate: Date; // Date
  paidThrough: string; // COD, Card, wallet, Net Banking
  paymentResponse: string; // { Long response object for charge back scenario }
  orderStatus: string; // customer-end: WAITING, FAILED - vendor-end: ACCEPT, REJECT, UNDER-PROCESS, READY
  remarks: string;
  deliveryId: string;
  appliedOffers: boolean;
  offerId: string;
  readyTime: number; // in minutes - max 60 minutes
}

const OrderSchema = new Schema(
  {
    orderId: { type: String, required: true },
    vendorId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'vendor',
      required: true,
    },
    customerId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'customer',
      required: true,
    },
    items: [
      {
        food: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: 'food',
          required: true,
        },
        unit: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    orderDate: { type: Date },
    paidThrough: { type: String },
    paymentResponse: { type: String },
    orderStatus: { type: String }, // type should be enum
    remarks: { type: String },
    deliveryId: { type: String },
    appliedOffers: { type: Boolean },
    offerId: { type: String },
    readyTime: { type: Number },
  },
  {
    toJSON: {
      transform(doc, ret, options) {
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
    timestamps: true,
  }
);

const Order = mongoose.model<OrderDoc>('order', OrderSchema);

export { Order };

import mongoose, { Document, Schema } from 'mongoose';
import { FoodCategory } from '../dto/Food.dto';

export interface FoodDoc extends Document {
  vendorId: string;
  name: string;
  description: string;
  category: FoodCategory;
  foodType: string;
  readyTime: number;
  price: number;
  rating: number;
  images: [string];
}

const FoodSchema = new Schema(
  {
    vendorId: { type: mongoose.SchemaTypes.ObjectId, ref: 'vendor' },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String },
    foodType: { type: String, required: true },
    readyTime: { type: Number },
    price: { type: Number, required: true },
    images: { type: [String] },
    rating: { type: Number },
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

const Food = mongoose.model<FoodDoc>('food', FoodSchema);

export { Food };

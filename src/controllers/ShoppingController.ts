import { Request, Response, NextFunction } from 'express';
import { FoodDoc, Vendor } from '../models';

export const GetFoodAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;
  const vendors = await Vendor.find({ pincode, serviceAvailable: true })
    .sort({ rating: 'descending' })
    .populate('foods');

  if (vendors?.length <= 0) {
    return res.status(404).json({ message: 'Data not found!' });
  }

  return res.status(200).json(vendors);
};

export const GetTopRestaurants = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;
  const vendors = await Vendor.find({ pincode, serviceAvailable: true })
    .sort({ rating: 'descending' })
    .limit(10);

  if (vendors?.length <= 0) {
    return res.status(404).json({ message: 'Data not found!' });
  }

  return res.status(200).json(vendors);
};

export const GetFoodsIn30Mins = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;
  const vendors = await Vendor.find({
    pincode,
    serviceAvailable: true,
  }).populate('foods');

  if (vendors?.length <= 0) {
    return res.status(404).json({ message: 'Data not found!' });
  }

  let foodResult: any = [];

  vendors.map((vendor) => {
    const foods = vendor.foods as FoodDoc[];
    foodResult.push(...foods.filter((food) => food.readyTime <= 30));
  });

  return res.status(200).json(foodResult);
};

export const SearchFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;
  const vendors = await Vendor.find({
    pincode,
    serviceAvailable: true,
  }).populate('foods');

  if (vendors?.length <= 0) {
    return res.status(404).json({ message: 'Data not found!' });
  }

  let foodResult: any = [];

  vendors.map((vendor) => foodResult.push(...vendor.foods));

  return res.status(200).json(foodResult);
};

export const RestaurantById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  const vendor = await Vendor.findById(id).populate('foods');

  if (!vendor) {
    return res.status(404).json({ message: 'Data not found!' });
  }

  return res.status(200).json(vendor);
};

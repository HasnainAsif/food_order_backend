export type FoodCategory = 'breakfast' | 'brunch' | 'lunch' | 'dinner';
export interface CreateFoodInput {
  name: string;
  description: string;
  category: FoodCategory;
  foodType: string; // non-veg, veg
  readyTime: string;
  price: string;
}

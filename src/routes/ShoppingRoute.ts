import express from 'express';
import {
  GetFoodAvailability,
  GetFoodsIn30Mins,
  GetTopRestaurants,
  RestaurantById,
  SearchFoods,
} from '../controllers';
// import { Authenticate } from '../middlewares';

const router = express.Router();

/** ------------------------ Food Availability ---------------------------------- **/
router.get('/:pincode', GetFoodAvailability);

/** ------------------------ Top Restaurants ---------------------------------- **/
router.get('/top-restaurants/:pincode', GetTopRestaurants);

/** ------------------------ Food Available in 30 Minutes ---------------------------------- **/
router.get('/foods-in-30-mins/:pincode', GetFoodsIn30Mins);

/** ------------------------ Search Foods ---------------------------------- **/
router.get('/search/:pincode', SearchFoods);

/** ------------------------ Find Restaurant By Id ---------------------------------- **/
router.get('/restaurant/:id', RestaurantById);

export { router as ShoppingRoute };

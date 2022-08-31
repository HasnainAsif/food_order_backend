import express from 'express';
import {
  AddToCart,
  CreateOrder,
  CustomerLogin,
  CustomerSignup,
  CustomerVerify,
  DeleteCart,
  EditCustomerProfile,
  GetCart,
  GetCustomerProfile,
  GetOrderById,
  GetOrders,
  RequestOtp,
} from '../controllers';
import { Authenticate } from '../middlewares';

const router = express.Router();

/** ------------------------ Signup / Create Customer ---------------------------------- **/
router.post('/signup', CustomerSignup);

/** ------------------------ Login ---------------------------------- **/
router.post('/login', CustomerLogin);

// Authentication
router.use(Authenticate);

/** ------------------------ Verify Customer Account ---------------------------------- **/
router.patch('/verify', CustomerVerify);

/** ------------------------ OTP / Requesting OTP ---------------------------------- **/
router.post('/otp', RequestOtp);

/** ------------------------ Profile ---------------------------------- **/
router.get('/profile', GetCustomerProfile);
router.patch('/profile', EditCustomerProfile);

/** ------------------------ Cart ---------------------------------- **/
router.post('/cart', AddToCart);
router.get('/cart', GetCart);
router.delete('/cart', DeleteCart);

// payment

/** ------------------------ Order ---------------------------------- **/
router.post('/create-order', CreateOrder);
router.get('/orders', GetOrders);
router.get('/order/:id', GetOrderById);

export { router as CustomerRoute };

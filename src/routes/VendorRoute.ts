import express from 'express';
import {
  AddFood,
  GetVendorOrders,
  GetFood,
  GetOrderDetails,
  GetvendorProfile,
  ProcessOrder,
  UpdatevendorCoverImage,
  UpdatevendorProfile,
  UpdatevendorService,
  vendorLogin,
} from '../controllers';
import { Authenticate } from '../middlewares';
import multer from 'multer';

const router = express.Router();

const imageStorage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'images');
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + '_' + file.originalname);
  },
});

const images = multer({ storage: imageStorage }).array('images', 10);

router.post('/login', vendorLogin);

router.use(Authenticate);
router.get('/profile', GetvendorProfile);
router.patch('/profile', UpdatevendorProfile);
router.patch('/coverimage', images, UpdatevendorCoverImage);
router.patch('/service', UpdatevendorService);

router.post('/food', images, AddFood);
router.get('/foods', GetFood);

// Orders
router.get('/orders', GetVendorOrders);
router.get('/orders/:id/process', ProcessOrder);
router.get('/orders/:id', GetOrderDetails);

export { router as vendorRoute };

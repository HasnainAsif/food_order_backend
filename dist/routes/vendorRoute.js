"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendorRoute = void 0;
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
exports.vendorRoute = router;
const imageStorage = multer_1.default.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'images');
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + '_' + file.originalname);
    },
});
const images = (0, multer_1.default)({ storage: imageStorage }).array('images', 10);
router.post('/login', controllers_1.vendorLogin);
router.use(middlewares_1.Authenticate);
router.get('/profile', controllers_1.GetvendorProfile);
router.patch('/profile', controllers_1.UpdatevendorProfile);
router.patch('/coverimage', images, controllers_1.UpdatevendorCoverImage);
router.patch('/service', controllers_1.UpdatevendorService);
router.post('/food', images, controllers_1.AddFood);
router.get('/foods', controllers_1.GetFood);
// Orders
router.get('/orders', controllers_1.GetVendorOrders);
router.get('/orders/:id/process', controllers_1.ProcessOrder);
router.get('/orders/:id', controllers_1.GetOrderDetails);
//# sourceMappingURL=vendorRoute.js.map
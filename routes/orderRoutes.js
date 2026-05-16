import express from 'express'
import * as authController from './../controllers/authController.js';
import * as orderController from './../controllers/orderController.js';


const router = express.Router();

app.use(authController.protect)

router.route('/')
    .post(orderController.createOrder)
    .get(orderController.getAllOrders)

router.get('/:id', orderController.getOrder);
router.get('/:id/status', orderController.getOrderStatus);
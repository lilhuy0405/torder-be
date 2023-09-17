import * as express from "express"
import {
  AuthController,
  CustomerController, DashBoardController,
  OrderController,
  ProductController,
  ShippingUnitController
} from "../controller";
import authMiddleWare from "../middleware/auth";

const router = express.Router()

const authController = new AuthController();
const orderController = new OrderController();
const shippingUnitController = new ShippingUnitController();
const customerController = new CustomerController();
const productController = new ProductController();
const dashBoardController = new DashBoardController();


router.post(`/auth/login`, authController.login.bind(authController));
router.post(`/auth/register`, authController.register.bind(authController));
router.get(`/users/me`, [authMiddleWare], authController.me.bind(authController));

router.post(`/orders/summary`, [], orderController.summary.bind(orderController));
router.post(`/orders/upload`, [authMiddleWare], orderController.uploadOrders.bind(orderController));
router.get(`/orders`, [authMiddleWare], orderController.getOrders.bind(orderController));
router.get(`/orders/count`, [authMiddleWare], orderController.countOrders.bind(orderController));
router.get(`/orders/:phoneNumber`, orderController.getOrderByPhoneNumber.bind(orderController));
router.delete(`/orders/:phoneNumber/:shipCode`, [authMiddleWare], orderController.deleteOrder.bind(orderController));
router.delete(`orders/by-source`, [authMiddleWare], orderController.deleteBySource.bind(orderController));


router.get(`/shipping-units`, [authMiddleWare], shippingUnitController.getAll.bind(shippingUnitController));
router.post(`/shipping-units`, [authMiddleWare], shippingUnitController.createShippingUnit.bind(shippingUnitController));
router.put(`/shipping-units/:id`, [authMiddleWare], shippingUnitController.updateShippingUnit.bind(shippingUnitController));
// router.delete(`/shipping-units/:id`, [authMiddleWare], shippingUnitController.deleteShippingUnit.bind(shippingUnitController));

router.get(`/customers`, [authMiddleWare], customerController.findAll.bind(customerController));
router.put(`/customers/:id`, [authMiddleWare], customerController.update.bind(customerController));
router.get(`/customers/:id/orders`, [authMiddleWare], customerController.getOrders.bind(customerController));

router.get(`/products`, [authMiddleWare], productController.findAll.bind(productController));
router.put(`/products/:id`, [authMiddleWare], productController.update.bind(productController));

router.get(`/dashboard`, [authMiddleWare], dashBoardController.count.bind(dashBoardController));


export default router;

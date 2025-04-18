import { Router } from "express";
import {
  cancelOrder,
  createOrder,
  getMyOrders,
  getOrder,
  getOrders,
  prepareForCustomer,
  updateOrderStatus,
} from "../controllers/orderCon.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { userRoleCheck } from "../middlewares/roleCheck.js";

const orderRouter = Router();

orderRouter.get(
  "/orders",
  isAuthenticated,
  userRoleCheck(["admin"]),
  getOrders
);

orderRouter.get("/orders/me", isAuthenticated, getMyOrders);

orderRouter.get("/orders/:orderId", isAuthenticated, getOrder);

orderRouter.post("/orders", isAuthenticated, createOrder);

orderRouter.patch(
  "/orders/:otderId/status",
  isAuthenticated,
  userRoleCheck(["admin"]),
  updateOrderStatus
);

orderRouter.post(
  "/orders/prepare",
  isAuthenticated,
  userRoleCheck(["admin", "kitchen"]),
  prepareForCustomer
);

orderRouter.patch(
  "/orders/:orderId/cancel",
  isAuthenticated, userRoleCheck(["admin", "kitchen"]),
  cancelOrder
);

export default orderRouter;
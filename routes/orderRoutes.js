import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrder,
  getOrders,
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

orderRouter.get("/orders/myorders", isAuthenticated, getMyOrders);

orderRouter.get("/orders/:id", isAuthenticated, getOrder);

orderRouter.post("/orders", isAuthenticated, createOrder);

orderRouter.put(
  "/orders/:id/status",
  isAuthenticated,
  userRoleCheck(["admin"]),
  updateOrderStatus
);

export default orderRouter;
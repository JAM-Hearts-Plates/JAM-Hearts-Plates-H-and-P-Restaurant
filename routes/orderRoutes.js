import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrder,
  getOrders,
  updateOrderStatus,
} from "../controllers/orderCon.js";
import { isAuthenticated, isAuthorized } from "../middleware/auth.js";

const orderRouter = Router();

orderRouter.get(
  "/orders",
  isAuthenticated,
  isAuthorized(["admin", "superadmin"]),
  getOrders
);

orderRouter.get("/orders/myorders", isAuthenticated, getMyOrders);

orderRouter.get("/orders/:id", isAuthenticated, getOrder);

orderRouter.post("/orders", isAuthenticated, createOrder);

orderRouter.put(
  "/orders/:id/status",
  isAuthenticated,
  isAuthorized(["admin"]),
  updateOrderStatus
);

export default orderRouter;
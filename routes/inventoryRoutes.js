import { Router } from "express";
import {
  createInventoryItem,
  deleteInventoryItem,
  getInventoryItem,
  getInventoryItems,
  getLowInventoryItems,
  restockInventory,
  updateInventoryItem,
} from "../controllers/inventoryCon.js";
import { isAuthenticated, isAuthorized } from "../middleware/auth.js";

const inventoryRouter = Router();

inventoryRouter.get(
  "/inventory",
  isAuthenticated,
  isAuthorized(["admin"]),
  getInventoryItems
);

inventoryRouter.get(
  "/inventory/low",
  isAuthenticated,
  isAuthorized(["admin"]),
  getLowInventoryItems
);

inventoryRouter.get(
  "/inventory/:id",
  isAuthenticated,
  isAuthorized(["admin"]),
  getInventoryItem
);

inventoryRouter.post(
  "/inventory",
  isAuthenticated,
  isAuthorized(["admin"]),
  createInventoryItem
);

inventoryRouter.put(
  "/inventory/:id",
  isAuthenticated,
  isAuthorized(["admin"]),
  updateInventoryItem
);

inventoryRouter.delete(
  "/inventory/:id",
  isAuthenticated,
  isAuthorized(["admin"]),
  deleteInventoryItem
);

inventoryRouter.put(
  "/inventory/:id/restock",
  isAuthenticated,
  isAuthorized(["admin"]),
  restockInventory
);

export default inventoryRouter;
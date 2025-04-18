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
import { isAuthenticated } from "../middlewares/auth.js";
import { userRoleCheck } from "../middlewares/roleCheck.js";

const inventoryRouter = Router();

inventoryRouter.get(
  "/inventory",
  isAuthenticated,
  userRoleCheck(["admin"]),
  getInventoryItems
);

inventoryRouter.get(
  "/inventory/low",
  isAuthenticated,
  userRoleCheck(["admin"]),
  getLowInventoryItems
);

inventoryRouter.get(
  "/inventory/:id",
  isAuthenticated,
  userRoleCheck(["admin"]),
  getInventoryItem
);

inventoryRouter.post(
  "/inventory",
  isAuthenticated,
  userRoleCheck(["admin"]),
  createInventoryItem
);

inventoryRouter.patch(
  "/inventory/:id",
  isAuthenticated,
  userRoleCheck(["admin"]),
  updateInventoryItem
);

inventoryRouter.delete(
  "/inventory/:id",
  isAuthenticated,
  userRoleCheck(["admin"]),
  deleteInventoryItem
);

inventoryRouter.put(
  "/inventory/:id/restock",
  isAuthenticated,
  userRoleCheck(["admin"]),
  restockInventory
);

export default inventoryRouter;
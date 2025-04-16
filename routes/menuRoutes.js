import { Router } from "express";
import {
  addMenu,
  deleteMenuItem,
  getMenuItem,
  getMenuItems,
  replaceMenuItem,
} from "../controllers/menuCon.js";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";
import { menuPicturesUpload } from "../middlewares/upload.js";

const menuRouter = Router();

menuRouter.get("/menu", getMenuItems);

menuRouter.get("/menu/:id", getMenuItem);

menuRouter.post(
  "/menu",
  isAuthenticated,
  isAuthorized(["admin"]),
  menuPicturesUpload.array("pictures", 5),
  addMenu
);

menuRouter.patch(
  "/menu/:id",
  isAuthenticated,
  isAuthorized(["admin"]),
  updateMenuItem
);

menuRouter.put(
  "/menu/:id",
  isAuthenticated,
  isAuthorized(["admin"]),
  menuPicturesUpload.array("pictures", 5),
  replaceMenuItem
);

menuRouter.delete(
  "/menu/:id",
  isAuthenticated,
  isAuthorized(["admin"]),
  deleteMenuItem
);

export default menuRouter;

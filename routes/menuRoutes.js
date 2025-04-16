import { Router } from "express";
import {
  addMenu,
  deleteMenuItem,
  getMenuItem,
  getMenuItems,
  replaceMenuItem,
  updateMenuItem,
} from "../controllers/menuCon.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { userRoleCheck } from "../middlewares/roleCheck.js";
import { menuPicturesUpload } from "../middlewares/upload.js";

const menuRouter = Router();

menuRouter.get("/menu", getMenuItems);

menuRouter.get("/menu/:id", getMenuItem);

menuRouter.post(
  "/menu",
  isAuthenticated,
  userRoleCheck(["admin"]),
  menuPicturesUpload.array("pictures", 5),
  addMenu
);


menuRouter.patch(
  "/menu/:id",
  isAuthenticated,
  userRoleCheck(["admin"]),
  updateMenuItem
);

menuRouter.put(
  "/menu/:id",
  isAuthenticated,
  userRoleCheck(["admin"]),
  menuPicturesUpload.array("pictures", 5),
  replaceMenuItem
);

menuRouter.delete(
  "/menu/:id",
  isAuthenticated,
  userRoleCheck(["admin"]),
  deleteMenuItem
);

export default menuRouter;

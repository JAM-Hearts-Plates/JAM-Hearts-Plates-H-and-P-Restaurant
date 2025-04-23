import { Router } from "express";
import {
  forgotPassword,
  loginUser,
  registerUser,
  resetPassword,
} from "../controllers/authCon.js";

const authRoutes = Router();

authRoutes.post("/users/signup", registerUser);

authRoutes.post("/users/login", loginUser);

authRoutes.post("/users/forgot-password", forgotPassword);

authRoutes.post("/users/reset-password/:token", resetPassword);

export default authRoutes;

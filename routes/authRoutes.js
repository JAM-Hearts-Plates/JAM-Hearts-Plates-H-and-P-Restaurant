import { Router } from "express";

import {
  forgotPassword,
  loginUser,
  registerUser,
  resetPassword,
} from "../controllers/authCon.js";
import { authenticateGoogle, googleCallback } from "../middlewares/auth.js";




const authRoutes = Router();

authRoutes.post("/users/signup", registerUser);

authRoutes.post("/users/login", loginUser);

authRoutes.post("/users/forgot-password", forgotPassword);

authRoutes.post("/users/reset-password/:token", resetPassword);

//google OAuth routes
authRoutes.get("/auth/google", authenticateGoogle);
authRoutes.get("/auth/google/callback", googleCallback);

authRoutes.get("/dashboard", (req, res) => {
    res.json({ message: "Welcome to your dashboard!" });
});


export default authRoutes;

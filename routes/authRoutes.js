import { Router } from "express";
import { forgotPassword, loginUser, registerUser, resetPassword } from "../controllers/authCon.js";



const authRoutes = Router();

authRoutes.post("/users/signup", registerUser)

authRoutes.post("/users/login", loginUser);

authRoutes.post('/forgot-password', forgotPassword);

authRoutes.post('/reset-password/:token', resetPassword);



export default authRoutes;
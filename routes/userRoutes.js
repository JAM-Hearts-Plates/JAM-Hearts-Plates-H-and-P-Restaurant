import { Router } from "express";
import { deleteUser, getAllUsers, getUser, updateUser } from "../controllers/userCon.js";


const userRoutes = Router();

userRoutes.patch("/user/:id", updateUser)

userRoutes.delete("/user/:id", deleteUser)

userRoutes.get("/user/:id", getUser)

userRoutes.get("/users", getAllUsers)


export default userRoutes;
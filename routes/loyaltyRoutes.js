import { Router } from "express";
import { earnPoints, redeemPoints, viewPoints } from "../controllers/loyaltyCon.js";


const loyaltyRoutes = Router();

loyaltyRoutes.post("/earnpoints", earnPoints)

loyaltyRoutes.post("/redeempoints", redeemPoints)

loyaltyRoutes.get("/viewpoints", viewPoints)

export default loyaltyRoutes;

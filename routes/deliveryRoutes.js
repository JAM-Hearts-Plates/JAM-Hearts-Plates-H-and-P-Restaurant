import { Router } from "express";
import { assignDelivery, createDelivery, deleteDelivery, getDelivery, updateDeliveryStatus } from "../controllers/deliveryCon.js";

const deliveryRoutes = Router();

deliveryRoutes.post("/delivery", createDelivery)
deliveryRoutes.patch("/delivery/:id", updateDeliveryStatus)
deliveryRoutes.get("/delivery/:id", getDelivery)
deliveryRoutes.delete("/delivery/:id", deleteDelivery)
deliveryRoutes.post("/assign-delivery", assignDelivery)



export default deliveryRoutes;
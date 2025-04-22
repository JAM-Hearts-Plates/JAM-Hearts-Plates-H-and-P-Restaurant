import { Router } from "express";
import { deleteRider, getAllRiders, getAvailableRiders, getRiderDeliveries, updateRider, updateRiderAvailability } from "../controllers/rider.js";



const riderRoutes = Router();


riderRoutes.patch("/rider-avail/:id", updateRiderAvailability)
riderRoutes.get("/riders-avail", getAvailableRiders)
riderRoutes.get("/rider-deliveries/:id", getRiderDeliveries)
riderRoutes.patch("/rider/:id", updateRider)
riderRoutes.delete("/rider/:id", deleteRider)
riderRoutes.get("/riders", getAllRiders)


export default riderRoutes;

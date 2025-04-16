import { Router } from "express";
import { deleteRider, getAllRiders, getAvailableRiders, getDriverDeliveries, updateDriverAvailability, updateRider } from "../controllers/rider.js";



const riderRoutes = Router();


riderRoutes.patch("/rider-avail/:id", updateDriverAvailability)
riderRoutes.get("/riders-avail", getAvailableRiders)
riderRoutes.get("/rider-deliveries/:id", getDriverDeliveries)
riderRoutes.patch("/rider/:id", updateRider)
riderRoutes.delete("/rider/:id", deleteRider)
riderRoutes.get("/riders", getAllRiders)


export default riderRoutes;

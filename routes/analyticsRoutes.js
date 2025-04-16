import { Router } from "express";
import { deleteEvent, getEvents, logEvent } from "../controllers/analyticsCon.js";

const analyticsRoutes = Router();

analyticsRoutes.post("/analytics", logEvent)

analyticsRoutes.get("/analytics", getEvents)

analyticsRoutes.delete("/delete/:id", deleteEvent)


export default analyticsRoutes;
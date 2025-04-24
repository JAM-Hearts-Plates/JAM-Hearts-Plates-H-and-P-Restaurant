import { Router } from "express";
import { deleteEvent, getEvents, logEvent } from "../controllers/analyticsCon.js";

const analyticsRoutes = Router();

analyticsRoutes.post("/analytics", logEvent)

analyticsRoutes.get("/analytics", getEvents)

analyticsRoutes.get("/analytics/:id", getEvents)

analyticsRoutes.delete("/analytics/:id", deleteEvent)


export default analyticsRoutes;
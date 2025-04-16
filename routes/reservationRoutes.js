import { Router } from "express";
import {
  getReservations,
  getReservation,
  getMyReservations,
  createReservation,
  updateReservationStatus,
  cancelReservation,
} from "../controllers/reservationCon.js";
import { isAuthenticated, isAuthorized } from "../middleware/auth.js";

const reservationRouter = Router();

reservationRouter.get(
  "/reservations",
  isAuthenticated,
  isAuthorized(["admin"]),
  getReservations
);

reservationRouter.get(
  "/reservations/myreservations",
  isAuthenticated,
  getMyReservations
);

reservationRouter.get("/reservations/:id", isAuthenticated, getReservation);

reservationRouter.post("/reservations", isAuthenticated, createReservation);

reservationRouter.put(
  "/reservations/:id/status",
  isAuthenticated,
  isAuthorized(["admin"]),
  updateReservationStatus
);

reservationRouter.put(
  "/reservations/:id/cancel",
  isAuthenticated,
  cancelReservation
);

export default reservationRouter;

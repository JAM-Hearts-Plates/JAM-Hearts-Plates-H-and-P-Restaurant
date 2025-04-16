import { Router } from "express";
import {
  getReservations,
  getReservation,
  getMyReservations,
  createReservation,
  updateReservationStatus,
  cancelReservation,
} from "../controllers/reservationCon.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { userRoleCheck } from "../middlewares/roleCheck.js";

const reservationRouter = Router();

reservationRouter.get(
  "/reservations",
  isAuthenticated,
  userRoleCheck(["admin"]),
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
  userRoleCheck(["admin"]),
  updateReservationStatus
);

reservationRouter.put(
  "/reservations/:id/cancel",
  isAuthenticated, userRoleCheck(['admin', 'user']),
  cancelReservation
);

export default reservationRouter;

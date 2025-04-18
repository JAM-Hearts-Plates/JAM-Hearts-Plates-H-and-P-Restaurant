import { ReservationModel } from "../models/reservation.js";
import { OrderModel } from "../models/order.js";
import { UserModel } from "../models/user.js";
import {TableModel} from "../models/table.js"
import appError from "../utils/appError.js";
import { sendReservationConfirmation } from "../services/notification.js";
import { reservationValidator } from "../validators/reservationVal.js";
import { updateReservationInCalendar, deleteReservationFromCalendar} from "../services/calendar.js";

// get all reservations (only admins)
export const getReservations = async (req, res, next) => {
  try {
    // Admin only
    if (req.auth.role !== "admin") {
      return next(new appError("Only admins can view all reservations", 403));
    }

    const { filter = "{}", sort = "{}" } = req.query;
    const reservations = await ReservationModel.find(JSON.parse(filter))
      .sort(JSON.parse(sort))
      .populate("user", "name email phone")
      .populate("chef", "name");

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    next(error);
  }
};

// get single reservation
export const getReservation = async (req, res, next) => {
  try {
    const reservation = await ReservationModel.findById(req.params.id)
      .populate("user", "name email")
      .populate("chef", "name")
      .populate("order");

    if (!reservation) {
      return next(
        new appError(`No reservation found with id ${req.params.id}`, 404)
      );
    }
    // making sure user is reservation owner
    if (
      reservation.user._id.toString() !== req.auth.id &&
      req.auth.role !== "admin"
    ) {
      return next(
        new appError("Not authorized to access this reservation", 401)
      );
    }
    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

// get current user reservation
export const getMyReservations = async (req, res, next) => {
  try {
    const reservations = await ReservationModel.find({
      user: req.auth.id,
    })

      .sort({ date: 1, time: 1 })
      .populate("chef", "name");

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    next(error);
  }
};

// create new reservation

export const createReservation = async (req, res, next) => {
  try {
    const { date, time, partySize, specialRequests, isLiveCooking,
      // tableType, tableLocation
     } = req.body;

    // check if the date is old
    const reservationDateTime = new Date(`${date}T${time}`);
    if (reservationDateTime < new Date()) {
      return next(new appError("Reservation date cannot be in the past", 400));
    }

    // validate reservation data
    const { error, value } = reservationValidator.validate({
      user: req.auth.id,
      date,
      time,
      partySize,
      specialRequests,
      isLiveCooking,
    });
    if (error) {
      return next(
        new appError(error.details.map((d) => d.message).join(", "), 422)
      );
    }
    const reservation = await ReservationModel.create(value);

// Try to reserve a table if requested
if (tableType || tableLocation) {
  try {
    const tableOptions = {
      capacity: partySize,
      tableType: tableType || 'regular',
      location: tableLocation || 'indoor',
      duration: 120 // 2 hours by default
    };
    
    const tableReservation = await reserveTable(req.auth.id, tableOptions);
    
    // Add table info to reservation
    reservation.tableId = tableReservation.tableId;
    reservation.tableNumber = tableReservation.tableNumber;
    await reservation.save();
  } catch (tableError) {
    // Don't fail the reservation if table reservation fails
    console.error('Failed to reserve table:', tableError);
  }
}

    // Integrate with calendar if it's a live cooking event
    if (isLiveCooking) {
      const calendarEventId = await addReservationToCalendar(reservation);
      reservation.calendarEventId = calendarEventId;
      await reservation.save();
    }

    // send confirmation
    await sendReservationConfirmation(req.auth, reservation);

    res.status(201).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    if (error.name === "MongooseError" && error.code === 11000) {
      return next(new appError("Duplicate reservation detected", 409));
    }
    next(error);
  }
};

// updating reservation status
export const updateReservationStatus = async (req, res, next) => {
  try {
    if (req.auth.role !== "admin") {
      return next(
        new appError("Only admins can update reservation status", 403)
      );
    }

    const reservation = await ReservationModel.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!reservation) {
      return next(
        new appError(`No reservation found with id ${req.params.id}`, 404)
      );
    }

    // Send notification if status changed
    if (req.body.status === "confirmed" || req.body.status === "cancelled") {
      await sendReservationUpdateNotification(reservation);

      if (reservation.calendarEventId) {
        await updateReservationInCalendar(reservation.calendarEventId, reservation);
      }

    }

    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

// cancel a reservation
export const cancelReservation = async (req, res, next) => {
  try {
    const reservation = await ReservationModel.findById(req.params.id);

    if (!reservation) {
      return next(
        new appError(`No reservation found with id ${req.params.id}`, 404)
      );
    }

    // make sure the reservation belongs to the right user
    if (reservation.user.toString() !== req.auth.id) {
      return next(
        new appError("Not authorized to cancel this reservation", 401)
      );
    }

    // Can't cancel if it's too close to the reservation time
    const reservationDateTime = new Date(
      `${reservation.date}T${reservation.time}`
    );
    const hoursUntilReservation =
      (reservationDateTime - new Date()) / (1000 * 60 * 60);

    if (hoursUntilReservation < 2) {
      return next(
        new appError(
          "Reservations can only be cancelled at least 2 hours before",
          400
        )
      );
    }

    // Send cancellation confirmation
    await sendReservationCancellationNotification(reservation);

    if (reservation.calendarEventId) {
      await deleteReservationFromCalendar(reservation.calendarEventId);
      reservation.calendarEventId = undefined; // optional: remove ID from DB
    }

    if (reservation.tableId) {
      try {
        await releaseTable(reservation.tableId);
        reservation.tableId = undefined;
        reservation.tableNumber = undefined;
      } catch (tableError) {
        console.error('Error releasing table:', tableError);
      }
    }
    
    reservation.status = "cancelled";
    await reservation.save();

    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

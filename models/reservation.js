import { Schema, Types, model } from "mongoose";
import normalize from "normalize-mongoose";

const reservationSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: [true, "Please add a date"],
    },
    time: { type: String, required: [true, "Please add a time"] },
    partySize: {
      type: Number,
      required: [true, "Please add party size"],
      min: 1,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    specialRequests: String,
    tableNumber: Number,
    order: { type: Types.ObjectId, ref: 'Order' },
    isLiveCooking: { type: Boolean, default: false },
    chef: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

reservationSchema.plugin(normalize);
export const ReservationModel = model("Reservation", reservationSchema);

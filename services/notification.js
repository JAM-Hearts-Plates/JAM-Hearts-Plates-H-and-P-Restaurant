import twilio from "twilio";
import appError from "../utils/appError.js";

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send SMS notification
export const sendSMS = async (to, body) => {
  try {
    await twilioClient.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
  } catch (err) {
    throw new appError("Failed to send SMS notification", 500);
  }
};

// Send order confirmation
export const sendOrderConfirmation = async (user, order) => {
  const message = `Your order #${order._id} has been received. Total: $${order.totalPrice}. Status: ${order.status}`;

  await sendSMS(user.phone, message);
};

// Send order completion
export const sendOrderCompletionNotification = async (order) => {
  const user = await UserModel.findById(order.user);
  const message = `Your order #${order._id} is ready for ${order.deliveryType === 'delivery' ? 'delivery' : 'pickup'}.`;
  await sendSMS(user.phone, message);
}

// Send reservation confirmation
export const sendReservationConfirmation = async (user, reservation) => {
  const message = `Your reservation for ${reservation.date} at ${reservation.time} for ${reservation.partySize} people has been confirmed.`;

  await sendSMS(user.phone, message);
};

// Send reservation update
export const sendReservationUpdateNotification = async (reservation) => {
  const user = await UserModel.findById(reservation.user);
  const message = `Your reservation status has been updated to ${reservation.status}.`;
  await sendSMS(user.phone, message);
};

// Send delivery update
export const sendDeliveryUpdate = async (user, delivery) => {
  const message = `Your delivery status: ${delivery.status}. Estimated delivery time: ${delivery.estimatedDeliveryTime}`;

  await sendSMS(user.phone, message);
};

import twilio from "twilio";
import {UserModel} from "../models/user.js"
import appError from "../utils/appError.js";
import { logger } from "../utils/logger.js";

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send SMS notification
export const sendSMS = async (to, body) => {
  try {
    if (!to) {
      logger.warn("Attempted to send SMS with no recipient phone number");
      return;
    }
    await twilioClient.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to:user.phone
    });

    logger.info(`SMS sent successfully. SID: ${message.sid}`);
    return message

  } catch (err) {
    logger.error(`Failed to send SMS: ${err.message}`, { error: err });
    throw new appError(`Failed to send SMS notification: ${err.message}`, 500);
  }
};

// Send order confirmation
export const sendOrderConfirmation = async (user, order, isVIP = false) => {
  try{
    // Skip if no phone number
    if (!user.phone) return;

        // Customize message based on user status
        let message = `Thank you for your order #${order._id}! `;
        message += `Total: $${order.totalPrice.toFixed(2)}. Status: ${order.status}.`;
        
        // Add extra message for VIP users
        if (isVIP) {
          message += " As a VIP customer, your order has been prioritized!";
        }

         // Include delivery/pickup info
    if (order.deliveryType === 'delivery') {
      message += " Your order will be delivered to you soon.";
    } else {
      message += " Your order will be ready for pickup soon.";
    }
    
    await sendSMS(user.phone, message);
    logger.info(`Order confirmation sent to user ${user._id}`);
  } catch (error) {
    logger.error(`Error sending order confirmation: ${error.message}`);
  
  }
}


// Send order completion notification
export const sendOrderCompletionNotification = async (order) => {
  try {
    // Get full user details if not populated
    let user = order.user;
    if (!user.phone) {
      user = await UserModel.findById(order.user);
    }
    
    if (!user || !user.phone) {
      logger.warn(`Cannot send completion notification - no phone for user ${order.user}`);
      return;
    }
    
    let message = `Good news! Your order #${order._id} is now complete and `;
    
    if (order.deliveryType === 'delivery') {
      message += "out for delivery! Estimated delivery time: ";
      message += order.estimatedDeliveryTime || "30-45 minutes";
    } else {
      message += "ready for pickup at our restaurant.";
    }
    
    await sendSMS(user.phone, message);
    logger.info(`Order completion notification sent for order ${order._id}`);
  } catch (error) {
    logger.error(`Error sending order completion notification: ${error.message}`);
  }
};



// Send reservation confirmation
export const sendReservationConfirmation = async (user, reservation) => {
  try {
    if (!user.phone) return;
    
    const date = new Date(reservation.date).toLocaleDateString();
    const message = `Your reservation for ${date} at ${reservation.time} for ${reservation.partySize} people has been confirmed.`;
    
    // Add live cooking info if applicable
    if (reservation.isLiveCooking) {
      message += " Your live cooking experience has been scheduled!";
    }
    
    await sendSMS(user.phone, message);
    logger.info(`Reservation confirmation sent for reservation ${reservation._id}`);
  } catch (error) {
    logger.error(`Error sending reservation confirmation: ${error.message}`);
  }
};

export const sendReservationUpdateNotification = async (reservation) => {
  try {
    const user = await UserModel.findById(reservation.user);
    
    if (!user || !user.phone) return;
    
    let message = `Your reservation status has been updated to: ${reservation.status}.`;
    
    if (reservation.status === 'confirmed') {
      message += " We look forward to seeing you!";
    } else if (reservation.status === 'cancelled') {
      message += " We're sorry for any inconvenience.";
    }
    
    await sendSMS(user.phone, message);
    logger.info(`Reservation update notification sent for reservation ${reservation._id}`);
  } catch (error) {
    logger.error(`Error sending reservation update: ${error.message}`);
  }
};

// Send reservation cancellation notification
export const sendReservationCancellationNotification = async (reservation) => {
  try {
    const user = await UserModel.findById(reservation.user);
    
    if (!user || !user.phone) return;
    
    const message = `Your reservation for ${new Date(reservation.date).toLocaleDateString()} at ${reservation.time} has been cancelled. If you have any questions, please contact us.`;
    
    await sendSMS(user.phone, message);
    logger.info(`Reservation cancellation notification sent for reservation ${reservation._id}`);
  } catch (error) {
    logger.error(`Error sending reservation cancellation: ${error.message}`);
  }
};

// Send delivery update
export const sendDeliveryUpdate = async (user, delivery) => {
  try {
    if (!user.phone) return;
    
    const message = `Delivery Update: Your order is ${delivery.status}. Estimated delivery time: ${delivery.estimatedDeliveryTime}.`;
    
    await sendSMS(user.phone, message);
    logger.info(`Delivery update sent to user ${user._id}`);
  } catch (error) {
    logger.error(`Error sending delivery update: ${error.message}`);
  }
};
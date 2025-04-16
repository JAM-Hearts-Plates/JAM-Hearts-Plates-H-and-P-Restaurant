import Joi from "joi";

export const deliveryValidator = Joi.object({
    orderId: Joi.string().required(), // Order ID is mandatory
    driverId: Joi.string().required(), // Driver ID is mandatory
    status: Joi.string().valid('pending', 'picked_up', 'in_transit', 'delivered', 'failed').required(), // Must match status options
    location: Joi.string().optional(), // Optional location
    estimatedDeliveryTime: Joi.date().optional(), // Optional estimated delivery time
    notes: Joi.string().optional() // Optional notes
  });
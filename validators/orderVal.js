import Joi from "joi";

export const orderItemValidator = Joi.object({
  menuItem: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).required(),
  price: Joi.number().positive().required(),
  specialInstructions: Joi.string().allow('').optional(),
  menuItem: Joi.string().hex().length(24).required().messages({ 
    'string.hex': 'Menu item ID must be a valid MongoDB ID',
    'any.required': 'Menu item is required'}),
  quantity: Joi.number().integer().min(1).required()  .messages({ 
    'number.min': 'Quantity must be at least 1',
    'number.base': 'Quantity must be a number'
  }),
  price: Joi.number().positive().precision(2).required(),
  specialInstructions: Joi.string().allow('').max(500)
});

export const orderValidator = Joi.object({
  user: Joi.string().hex().length(24).required(),
  items: Joi.array().items(orderItemValidator).min(1).required(),
  totalPrice: Joi.number().positive().required(),
  status: Joi.string()
    .valid("pending", "processing", "completed", "cancelled")
    .default("pending"),
  paymentMethod: Joi.string().valid("cash", "card", "online").required(),
  paymentStatus: Joi.string()
    .valid("pending", "paid", "failed")
    .default("pending"),
  deliveryAddress: Joi.string().when("deliveryType", {
    is: "delivery",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  deliveryType: Joi.string().valid("pickup", "delivery").required(),
  estimatedCookingTime: Joi.number().min(1).required(),
  cookingBreakdown: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        prepTime: Joi.number().min(1).required(),
      })
    ).required(),
  transactionId: Joi.string().optional(),
  estimatedDeliveryTime: Joi.date().optional(),
  notes: Joi.string().optional(),
});

export const updateOrderValidator = Joi.object({
  status: Joi.string().valid("pending", "processing", "completed", "cancelled"),
  paymentStatus: Joi.string().valid("pending", "paid", "failed"),
  estimatedDeliveryTime: Joi.date()
}).min(1);

export const cancelOrderValidator = Joi.object({
  reason: Joi.string().max(500).optional(),
  refundRequested: Joi.boolean().when('paymentStatus', {
    is: 'paid',
    then: Joi.boolean().required(),
    otherwise: Joi.forbidden()
  })
});
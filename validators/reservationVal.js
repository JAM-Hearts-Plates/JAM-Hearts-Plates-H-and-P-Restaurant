import Joi from "joi";

export const reservationValidator = Joi.object({
  user: Joi.string().hex().length(24).required(),
  date: Joi.date().required().messages({
    "date.base": "Please add a valid date",
    "any.required": "Please add a date",
  }),
  time: Joi.string().required().messages({
    "string.empty": "Please add a time",
    "any.required": "Please add a time",
  }),
  partySize: Joi.number().integer().min(1).required().messages({
    "number.base": "Please add a valid party size",
    "number.min": "Party size must be at least 1",
    "any.required": "Please add party size",
  }),
  status: Joi.string()
    .valid("pending", "confirmed", "cancelled", "completed")
    .default("pending"),
  specialRequests: Joi.string().allow("").optional(),
  tableNumber: Joi.number().integer().min(1).optional(),
  order: Joi.string().hex().length(24).optional(),
  isLiveCooking: Joi.boolean().default(false),
  chef: Joi.string().hex().length(24).optional(),
});

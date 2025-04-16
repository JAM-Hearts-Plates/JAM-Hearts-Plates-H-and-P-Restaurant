import Joi from "joi";

export const inventoryValidator = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Please add a name",
    "any.required": "Please add a name",
  }),
  category: Joi.string().required().messages({
    "string.empty": "Please add category",
    "any.required": "Please add category",
  }),
  quantity: Joi.number().min(0).required().messages({
    "number.base": "Please add a valid quantity",
    "number.min": "Quantity cannot be negative",
    "any.required": "Please add quantity",
  }),
  unit: Joi.string().required().messages({
    "string.empty": "Please add unit",
    "any.required": "Please add unit",
  }),
  threshold: Joi.number().min(0).required().messages({
    "number.base": "Please add a valid threshold",
    "number.min": "Quantity cannot be negative",
    "any.required": "Please add threshold",
  }),
  lastRestocked: Joi.date().optional(),
  supplier: Joi.string().optional(),
  costPerUnit: Joi.number().min(0).optional().messages({
    "number.base": "Please add a valid cost per unit",
    "number.min": "Cost per unit cannot be negative",
  }),
});

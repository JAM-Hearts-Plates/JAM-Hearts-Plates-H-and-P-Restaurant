import Joi from "joi";

export const addMenuValidator = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  category: Joi.string().required(),
  pictures: Joi.array().items(Joi.string()).required(),
  isAvailable: Joi.boolean().strict().default(true),
  ingredients: Joi.array().items(Joi.string().pattern(/^[a-zA-Z0-9\s]+$/)).optional(),
  prepTime: Joi.number().optional()
});

export const replaceMenuValidator = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  pictures: Joi.array().items(Joi.string()).required(),
  isAvailable: Joi.boolean().strict().default(true),
  ingredients: Joi.array().items(Joi.string().hex().length(24)).optional(),
  prepTime: Joi.number().optional()
});

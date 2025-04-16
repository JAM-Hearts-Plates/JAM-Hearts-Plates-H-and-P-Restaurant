import Joi from "joi";


export const loyaltyValidator = Joi.object({
    userId: Joi.string().required(), // User ID is mandatory
    points: Joi.number().min(1).required(), // Points must be a positive number
    actionType: Joi.string().valid('earn', 'redeem').required(), // Must be either 'earn' or 'redeem'
    description: Joi.string().optional() // Description is optional
  });
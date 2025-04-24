import Joi from "joi";

// Helper for conditional VIP fields
const vipConditional = {
  is: true,
  then: Joi.required(),
  otherwise: Joi.forbidden()
};

export const vipValidator = {
  // VIP Qualification Criteria
  qualifyVIP: Joi.object({
    pointsEarned: Joi.number().min(1000).required(),
    orderCount: Joi.number().integer().min(5).required(),
    totalSpent: Joi.number().min(500).required(),
    qualificationDate: Joi.date().default(() => new Date())
  }),

  // VIP Benefits Structure
  benefits: Joi.object({
    discountRate: Joi.number().min(0).max(30).required(),
    freeDelivery: Joi.boolean().default(false),
    priorityReservation: Joi.boolean().default(true),
    complimentaryItems: Joi.array().items(
      Joi.object({
        itemId: Joi.string().required(),
        name: Joi.string().required(),
        limit: Joi.number().min(1)
      })
    ).optional()
  }),

  // VIP Status Change Actions
  statusChange: Joi.object({
    action: Joi.string().valid('upgrade', 'downgrade', 'extend', 'revoke').required(),
    level: Joi.string().valid('silver', 'gold', 'platinum').when('action', {
      is: Joi.valid('upgrade', 'downgrade'),
      then: Joi.required(),
      otherwise: Joi.forbidden()
    }),
    durationMonths: Joi.number().integer().min(1).max(24).when('action', {
      is: 'extend',
      then: Joi.required(),
      otherwise: Joi.forbidden()
    }),
    reason: Joi.string().max(500).when('action', {
      is: 'revoke',
      then: Joi.optional(),
      otherwise: Joi.forbidden()
    })
  }),

  // VIP User Fields
  userFields: {
    isVIP: Joi.boolean().default(false),
    vipLevel: Joi.string().valid('silver', 'gold', 'platinum').when('isVIP', vipConditional),
    vipSince: Joi.date().when('isVIP', vipConditional),
    vipExpiresAt: Joi.date().min(Joi.ref('vipSince')).when('isVIP', {
      is: true,
      then: Joi.optional(),
      otherwise: Joi.forbidden()
    }),
    vipDurationMonths: Joi.number().integer().min(1).max(24).when('isVIP', {
      is: true,
      then: Joi.optional(),
      otherwise: Joi.forbidden()
    })
  }
};
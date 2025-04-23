import Joi from 'joi';

export const tableValidator = {
  validateTable: Joi.object({
    tableNumber: Joi.number().required().min(1),
    type: Joi.string()
      .valid('regular', 'vip_section', 'premium_window_seat')
      .default('regular'),
    capacity: Joi.number().required().min(1).max(12),
    location: Joi.string()
      .valid('indoor', 'outdoor', 'balcony')
      .default('indoor'),
    isAvailable: Joi.boolean().default(true)
  }),
  
  validateReservation: Joi.object({
    tableId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    duration: Joi.number().min(30).max(240).default(120),
    orderId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null)
  })
};
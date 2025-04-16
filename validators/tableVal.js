// import Joi from 'joi';

// export const tableValidator = {
//   validateTable: Joi.object({
//     tableNumber: Joi.number().required().min(1),
//     type: Joi.string().valid('regular', 'vip_section', 'premium_window_seat'),
//     capacity: Joi.number().required().min(1).max(12),
//     location: Joi.string().valid('indoor', 'outdoor', 'balcony')
//   }),
  
//   validateReservation: Joi.object({
//     tableId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
//     duration: Joi.number().min(30).max(240),
//     orderId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null)
//   })
// };
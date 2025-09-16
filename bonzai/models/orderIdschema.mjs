import Joi from 'joi';

export const orderIdSchema = Joi.object({
  orderId: Joi.string().alphanum().length(5).required().messages({
    'string.length': 'orderId must be exactly 5 characters',
    'string.alphanum': 'orderId can only contain letters and numbers',
  }),
});

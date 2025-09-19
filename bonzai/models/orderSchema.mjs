import Joi from 'joi';

export const orderSchema = Joi.object({
  numberOfGuests: Joi.number().integer().min(1).required(),
  rooms: Joi.array().items(Joi.string().required()).required(),
  numberOfNights: Joi.number().integer().min(1).required(),
  name: Joi.string().required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
});

import Joi from 'joi';

export const orderSchema = Joi.object({
  guests: Joi.number().min(1).required(),
  rooms: Joi.array().items(Joi.string().required()),
  nights: Joi.number().min(1).required(),
  name: Joi.string().required(),
  email: Joi.string().required(),
});

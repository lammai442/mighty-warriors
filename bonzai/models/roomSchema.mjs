import Joi from 'joi';

const types = ['single', 'double', 'suite'];

export const roomSchema = Joi.object({
  type: Joi.string()
    .valid(...types)
    .required()
    .messages({ 'any.only': 'Room type must be single, double or suite' }),
  beds: Joi.number().integer().min(1).max(3).required(),
  available: Joi.boolean().default(true),
  price: Joi.number().min(0).max(20000).required(),
});

import Joi from 'joi';

export const putOrderByIdSchema = Joi.object({
  numberOfGuests: Joi.number().integer().min(1).optional(),
  numberOfNights: Joi.number().integer().min(1).optional(),
  removeRoomId: Joi.string()
    .min(1)
    .pattern(/^ROOM#[A-Z]+#[a-z0-9]+$/)
    .optional(),
  newRoomId: Joi.string()
    .min(1)
    .pattern(/^ROOM#[A-Z]+#[a-z0-9]+$/)
    .optional(),
});

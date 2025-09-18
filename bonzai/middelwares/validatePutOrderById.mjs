import { putOrderByIdSchema } from '../models/putOrderByIdSchema.mjs';

export const validatePutOrderById = () => ({
  before: (handler) => {
    const { error, value } = putOrderByIdSchema.validate(handler.event.body);

    if (error) {
      console.log('Error in middleware ValidateOrder: ', error);
      console.log('Value in middleware ValidateOrder: ', value);

      throw new Error(error.details[0].message);
    }
  },
});

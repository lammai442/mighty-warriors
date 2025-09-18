import { orderSchema } from '../models/orderSchema.mjs';

export const validateOrder = () => ({
  before: (handler) => {
    const { error, value } = orderSchema.validate(handler.event.body);

    if (error) {
      console.log('Error in middleware ValidateOrder: ', error);
      console.log('Value in middleware ValidateOrder: ', value);

      throw new Error(error.details[0].message);
    }
  },
});

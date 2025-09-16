import { orderIdSchema } from '../models/orderIdschema.mjs';

export const validateOrderId = () => ({
  before: (handler) => {
    const { orderId } = handler.event.pathParameters || {};
    const { error, value } = orderIdSchema.validate({ orderId });

    console.log('Error i middleware: ', error);
    console.log('Value i middleware: ', value);
    if (error) throw new Error(error.details[0].message);
  },
});

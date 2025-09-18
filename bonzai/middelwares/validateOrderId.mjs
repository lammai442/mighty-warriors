import { orderIdSchema } from '../models/orderIdschema.mjs';

export const validateOrderId = () => ({
  before: (handler) => {
    const { orderId } = handler.event.pathParameters || {};
    const { error, value } = orderIdSchema.validate({ orderId });

    console.log('Error i validateOrderId middleware: ', error);
    console.log('Value i validateOrderId middleware: ', value);
    if (error) throw new Error(error.details[0].message);
  },
});

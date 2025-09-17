import middy from '@middy/core';
import { sendResponses } from '../../responses/index.mjs';
import { errorHandler } from '../../middelwares/errorHandler.mjs';
import { getOrderById } from '../../services/orders.mjs';
import { validateOrderId } from '../../middelwares/validateOrderId.mjs';

export const handler = middy(async (event) => {
  const { orderId } = event.pathParameters || {};

  const result = await getOrderById(orderId);

  if (result) {
    return sendResponses(200, { success: true, orders: result });
  } else {
    return sendResponses(404, {
      success: false,
      message: `Could not find order with orderId: ${orderId}`,
    });
  }
})
  .use(validateOrderId())
  .use(errorHandler());

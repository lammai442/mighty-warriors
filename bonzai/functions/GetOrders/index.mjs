import middy from '@middy/core';
import { sendResponses } from '../../responses/index.mjs';
import { errorHandler } from '../../middelwares/errorHandler.mjs';
import { getAllOrders } from '../../services/orders.mjs';
import { validateOrderId } from '../../middelwares/validateOrderId.mjs';

export const handler = middy(async (event) => {
  const result = await getAllOrders();

  if (result) {
    return sendResponses(200, { success: true, orders: result });
  } else {
    return sendResponses(400, {
      success: false,
      message: 'Could not find orders',
    });
  }
}).use(errorHandler());

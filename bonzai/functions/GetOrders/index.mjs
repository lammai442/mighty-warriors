import middy from '@middy/core';
import { sendResponses } from '../../responses/index.mjs';
import { errorHandler } from '../../middlewares/errorHandler.mjs';
import { getAllOrders } from '../../services/orders.mjs';
import { validateOrderId } from '../../middlewares/validateOrderId.mjs';
import { getRoomById } from '../../services/rooms.mjs';

export const handler = middy(async (event) => {
  const result = await getAllOrders();

  if (result) {
    return sendResponses(200, {
      success: true,
      orders: result,
    });
  } else {
    return sendResponses(400, {
      success: false,
      message: 'Could not find orders',
    });
  }
}).use(errorHandler());

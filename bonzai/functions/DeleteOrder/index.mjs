import middy from '@middy/core';
import { sendResponses } from '../../responses/index.mjs';
import { errorHandler } from '../../middelwares/errorHandler.mjs';
import { getRoomById, toggleAvailableRoom } from '../../services/rooms.mjs';
import { getOneOrder, getOrderById } from '../../services/orders.mjs';
import { validateOrderId } from '../../middelwares/validateOrderId.mjs';

export const handler = middy(async (event) => {
  const orderId = event.pathParameters.orderId;

  const order = await getOrderById(orderId);
  console.log(order);

  // Togglar rummet från bokat till ledigt.
  const roomID = 'ROOM#DOUBLE#0fe89';
  const room = await getRoomById(roomID);
  const toggledAvailable = !room.available;
  const result = await toggleAvailableRoom(roomID, toggledAvailable);

  if (result)
    return sendResponses(200, {
      message: 'success',
      orderId: orderId,
      order: order,
      result: result,
    });
  else
    return sendResponses(404, {
      success: false,
      message: 'Order could not be found.',
    });
})
  .use(validateOrderId())
  .use(errorHandler());

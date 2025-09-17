import middy from '@middy/core';
import { sendResponses } from '../../responses/index.mjs';
import { errorHandler } from '../../middelwares/errorHandler.mjs';
import { getRoomById, toggleAvailableRoom } from '../../services/rooms.mjs';
import { deleteOrder, getOrderById } from '../../services/orders.mjs';
import { validateOrderId } from '../../middelwares/validateOrderId.mjs';

export const handler = middy(async (event) => {
  const orderId = event.pathParameters.orderId;

  const order = await getOrderById(orderId);

  // Togglar alla rum som finns i ordern från bokade till tillgängliga.
  order.roomsBooked.map(async (room) => {
    const roomId = room.sk;
    const collectedRoom = await getRoomById(roomId);
    const toggledAvailable = !collectedRoom.available;
    return await toggleAvailableRoom(roomId, toggledAvailable);
  });

  // Raderar ordern
  const result = await deleteOrder(orderId);

  // Funktionen deleteOrder() innehåller nyckeln ReturnValues: 'ALL_OLD'. Det innebär att det raderade objektet finns med i svaret från funktionen, under result.Attributes. Om result.Attributes saknas har funktionen alltså inte lyckats hitta och radera något objekt.
  if (result.Attributes)
    return sendResponses(200, {
      message: 'Order successfully deleted',
    });
  else
    return sendResponses(404, {
      success: false,
      message: 'Order could not be found.',
    });
})
  .use(validateOrderId())
  .use(errorHandler());

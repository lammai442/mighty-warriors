import middy from '@middy/core';
import { sendResponses } from '../../responses/index.mjs';
import { errorHandler } from '../../middelwares/errorHandler.mjs';
import { getRoomById, toggleAvailableRoom } from '../../services/rooms.mjs';

export const handler = middy(async (event) => {
  const param = event.pathParameters.orderID;

  // Togglar rummet från bokat till ledigt.
  const roomID = 'ROOM#DOUBLE#0fe89';
  const room = await getRoomById(roomID);
  const toggledAvailable = !room.available;
  const result = await toggleAvailableRoom(roomID, toggledAvailable);

  if (result)
    return sendResponses(200, {
      message: 'success',
      param: param,
      result: result,
    });
  else
    return sendResponses(404, {
      success: false,
      message: 'Order could not be found.',
    });
}).use(errorHandler());

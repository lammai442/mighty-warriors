import middy from '@middy/core';
import { sendResponses } from '../../responses/index.mjs';
import { getAvailableRooms } from '../../services/rooms.mjs';
import { errorHandler } from '../../middlewares/errorHandler.mjs';

export const handler = middy(async (event) => {
  const rooms = await getAvailableRooms();
  if (rooms) return sendResponses(200, { message: 'success', data: rooms });
  else
    return sendResponses(404, {
      success: false,
      message: 'Rooms could not be found.',
    });
}).use(errorHandler());

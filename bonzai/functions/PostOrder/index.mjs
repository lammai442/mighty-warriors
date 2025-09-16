import { sendResponses } from '../../responses/index.mjs';
import middy from '@middy/core';
import { errorHandler } from '../../middelwares/errorHandler.mjs';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { validateOrder } from '../../middelwares/validateOrder.mjs';
import { getAllRooms } from '../../services/rooms.mjs';

export const handler = middy(async (event) => {
  const orderRequest = event.body;
  const allRooms = await getAllRooms();

  const orderRooms = [];

  // Loopar igenom alla rumsID som skickas med i body
  for (const roomId of orderRequest.rooms) {
    // Letar upp det efterfrågade rummet
    const room = allRooms.find((r) => r.sk.includes(roomId));

    // Om rummet inte finns så returneras 404
    if (room === undefined) {
      return sendResponses(404, {
        message: `Room with ID: ${roomId} doesn't exist`,
      });

      // Om rummet finns men är otillgängligt
    } else if (room.available === false) {
      return sendResponses(503, {
        message: `Room with ID: ${roomId} is unavailable`,
      });

      // Om rummet finns och är tillgängligt
    } else {
      orderRooms.push(room);
    }
  }

  // ----- -----

  // Verification against number of guests versus number of beds

  // Adjust the rooms' availability "true/false"

  // Create a new order with unique orderId

  return sendResponses(201, {
    message: 'Successfully created order',
    orderRooms,
  });
})
  .use(httpJsonBodyParser())
  .use(validateOrder())
  .use(errorHandler());

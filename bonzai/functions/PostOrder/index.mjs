import { sendResponses } from '../../responses/index.mjs';
import middy from '@middy/core';
import { errorHandler } from '../../middelwares/errorHandler.mjs';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { validateOrder } from '../../middelwares/validateOrder.mjs';
import { getAllRooms } from '../../services/rooms.mjs';
import { createOrder } from '../../services/orders.mjs';
import { toggleAvailableRoom } from '../../services/rooms.mjs';
import { generateId } from '../../utils/generateId.mjs';
import { validateBeds, validateRooms } from '../../utils/validators.mjs';

export const handler = middy(async (event) => {
  const orderRequest = event.body;

  const allRooms = await getAllRooms();

  const orderRooms = [];

  // Loopar igenom alla rumsID som skickas med i body
  for (const roomId of orderRequest.rooms) {
    // Letar upp det efterfrågade rummet (i varje loop)
    // Inte bara true/false utan hela rummet
    const room = allRooms.find((r) => r.sk.includes(roomId));

    // Om rummet inte finns så returneras 404
    if (room === undefined) {
      return sendResponses(404, {
        success: false,
        message: `Room with ID: ${roomId} doesn't exist`,
      });

      // Om rummet finns men är otillgängligt
    } else if (room.available === false) {
      return sendResponses(503, {
        success: false,
        message: `Room with ID: ${roomId} is unavailable`,
      });

      // Om rummet finns och är tillgängligt
    } else {
      orderRooms.push(room);
    }
  }
  orderRequest.roomsBooked = orderRooms;
  delete orderRequest.rooms;

  // ----- -----

  if (!validateBeds(orderRequest)) {
    return sendResponses(400, {
      success: false,
      message: `Can't order rooms with fewer beds than there are guests.`,
    });
  }

  if (!validateRooms(orderRequest)) {
    return sendResponses(400, {
      success: false,
      message: `Can't order more rooms than there are guests.`,
    });
  }

  let pricePerNight = 0;

  orderRooms.forEach((room) => {
    // numberOfBeds += room.beds;
    pricePerNight += room.price;
  });

  orderRequest.totalPrice = pricePerNight * orderRequest.numberOfNights;
  orderRequest.orderId = generateId('ORDER');

  // Skapar ordern
  const result = await createOrder(orderRequest);

  if (result) {
    // Om vi lyckats skapa en order så ändras "available" på rummen till false.
    for (const room of orderRequest.roomsBooked) {
      await toggleAvailableRoom(room.sk, false);
    }

    return sendResponses(201, {
      success: true,
      message: 'Successfully created order',
      order: orderRequest,
    });
  } else {
    return sendResponses(500, {
      success: false,
      message: 'Server error. Order could not be created',
    });
  }
})
  .use(httpJsonBodyParser())
  .use(validateOrder())
  .use(errorHandler());

import { sendResponses } from '../../responses/index.mjs';
import middy from '@middy/core';
import { errorHandler } from '../../middelwares/errorHandler.mjs';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { validateOrder } from '../../middelwares/validateOrder.mjs';
import { getAllRooms } from '../../services/rooms.mjs';
import { createOrder } from '../../services/orders.mjs';
import { toggleAvailableRoom } from '../../services/rooms.mjs';

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

  // Kontroll att det inte är fler gäster än sängar
  let numberOfBeds = 0;
  let price = 0;

  orderRooms.forEach((room) => {
    numberOfBeds += room.beds;
    price += room.price;
  });

  if (orderRequest.guests > numberOfBeds) {
    return sendResponses(400, {
      message: `Can't order rooms with fewer beds than there are guests.`,
    });
  }

  // ----- -----

  // Byter ut .rooms mot de rum som hämtades innan
  // All annan data som behövs finns annars redan i orderRequest
  orderRequest.rooms = orderRooms;
  orderRequest.price = price;

  // Skapar ordern
  const result = await createOrder(orderRequest);

  if (result) {
    // Om vi lyckats skapa en order så ändras "available" på rummen till false.
    for (const room of orderRequest.rooms) {
      await toggleAvailableRoom(room.sk, false);
    }

    return sendResponses(201, {
      message: 'Successfully created order',
      orderRooms,
    });
  }
})
  .use(httpJsonBodyParser())
  .use(validateOrder())
  .use(errorHandler());

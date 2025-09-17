import middy from '@middy/core';
import { sendResponses } from '../../responses/index.mjs';
import { errorHandler } from '../../middelwares/errorHandler.mjs';
import { validateOrderId } from '../../middelwares/validateOrderId.mjs';
import {
  updateOrder,
  updateNumberOfNights,
  getOrderById,
  updateNumberOfGuests,
} from '../../services/orders.mjs';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { getAllRooms } from '../../services/rooms.mjs';
export const handler = middy(async (event) => {
  const { orderId } = event.pathParameters || {};
  let currentOrder = await getOrderById(orderId);
  const updateReq = event.body;

  let updatedOrder = {};

  if (orderId) {
    // Hämtar hem alla rum
    const allRooms = await getAllRooms();

    if (updateReq.changeRoomId && updateReq.newRoomId) {
      const changeRoomExists = allRooms.some(
        (r) => r.sk === updateReq.changeRoomId
      );
      const newRoomExists = allRooms.some((r) => r.sk === updateReq.newRoomId);
      const isNewRoomAvailable = allRooms.some(
        (r) => r.sk === updateReq.newRoomId && r.available === true
      );

      if (!changeRoomExists) {
        return sendResponses(400, {
          success: false,
          message: 'Invalid Id of changeRoomId',
        });
      } else if (!newRoomExists) {
        return sendResponses(400, {
          success: false,
          message: 'Invalid Id of newRoomId',
        });
      } else if (!isNewRoomAvailable) {
        return sendResponses(400, {
          success: false,
          message: 'Choice of new room is not available',
        });
      }
      // Här läggs de nuvarande rum som finns i ordern
      let rooms = currentOrder.roomsBooked
        .filter((r) => r.sk !== updateReq.changeRoomId)
        .map((r) => r.sk);
      // Lägger till det nya rummet i listan
      rooms.push(updateReq.newRoomId);
      // Lägger in arrayen i updateOrder som senare ska skickas in till client
      updatedOrder = { ...updatedOrder, rooms };
    }

    if (updateReq.guests) {
      // Kontroll att det inte är fler gäster än sängar
      let numberOfBeds = 0;
      let price = 0;
      const roomsToCheck =
        updatedOrder.rooms || currentOrder.roomsBooked.map((r) => r.sk);

      roomsToCheck.forEach((roomId) => {
        const room = allRooms.find((r) => r.sk === roomId);
        if (room) {
          numberOfBeds += room.beds;
          price += room.price;
        }
      });

      if (updateReq.guests > numberOfBeds) {
        return sendResponses(400, {
          success: false,
          message: `Can't order rooms with fewer beds than there are guests.`,
        });
      } else {
        updatedOrder.guests = updateReq.guests;
        updatedOrder.price = price;
      }
    }

    if (updateReq.nights) updatedOrder.nights = updateReq.nights;

    // const result = await updateOrder(updatedOrder, orderId);

    return sendResponses(200, {
      success: true,
      updatedOrder: updatedOrder,
      currentOrder: currentOrder,
    });
  } else {
    return sendResponses(400, {
      success: false,
      message: 'Could not find order',
    });
  }
})
  .use(httpJsonBodyParser())
  .use(validateOrderId())
  .use(errorHandler());

// Som en gäst vill jag kunna ändra min bokning ifall mina planer ändras.

// API endpoint: /api/orders/{orderID}

// PUT på orderID

// Följande detaljer kan ändras i en bokning men logiken för rummen ska följas om antalet gäster eller rum ändras:

// Antal gäster
// Vilka rumstyper och antal
// Antal nätter
// modifiedAt (datum med utilsfunktionen generateDate)
// Eventuellt extra att göra:

// Toggla "available = true/false" för rummen

[
  {
    M: {
      available: { BOOL: true },
      sk: { S: 'ROOM#DOUBLE#0d01f' },
      createdAt: { S: '2025-09-15T13:05:18.537Z' },
      pk: { S: 'ROOM' },
      beds: { N: '2' },
      price: { N: '1000' },
    },
  },
  {
    M: {
      available: { BOOL: true },
      sk: { S: 'ROOM#DOUBLE#7a8c6' },
      createdAt: { S: '2025-09-15T13:05:15.482Z' },
      pk: { S: 'ROOM' },
      beds: { N: '2' },
      price: { N: '1000' },
    },
  },
];

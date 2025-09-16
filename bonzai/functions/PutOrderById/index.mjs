import middy from '@middy/core';
import { sendResponses } from '../../responses/index.mjs';
import { errorHandler } from '../../middelwares/errorHandler.mjs';
import { validateOrderId } from '../../middelwares/validateOrderId.mjs';
import {
  editOrder,
  updateNumberOfNights,
  getOneOrder,
  updateNumberOfGuests,
} from '../../services/orders.mjs';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { getRoomById } from '../../services/rooms.mjs';
export const handler = middy(async (event) => {
  const { orderId } = event.pathParameters || {};
  const currentOrder = await getOneOrder(orderId);
  const { roomId, newRoomId, numberOfGuests, numberOfNights } = event.body;

  //   let newOrder = {};

  //   if (newRoomId) {
  //     const room = await getRoomById(event.body.newRoomId);
  //     console.log('ROOM: ', room);

  //     if (room.available) {
  //       newOrder = {
  //         ...currentOrder,
  //       };
  //     }
  //   }
  //   let numberOfBeds = 0;

  //   currentOrder.hiredRooms.forEach((room) => {
  //     numberOfBeds += room.beds;
  //   });

  //   if (numberOfBeds === event.body.numberOfBeds) {
  // const updates = event.body;

  if (orderId) {
    // const result = await editOrder(updates, orderId);
    let result = {};

    if (numberOfNights) {
      const updatedNights = await updateNumberOfNights(numberOfNights, orderId);
      result = { ...result, ...updatedNights };
    }
    if (numberOfGuests) {
      const updatedGuests = await updateNumberOfGuests(numberOfGuests, orderId);
      result = { ...result, ...updatedGuests };
    }
    return sendResponses(200, {
      success: true,
      updatedOrder: result,
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

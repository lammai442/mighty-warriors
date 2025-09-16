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
import { getAllRooms, getRoomById } from '../../services/rooms.mjs';
export const handler = middy(async (event) => {
  const { orderId } = event.pathParameters || {};
  const currentOrder = await getOneOrder(orderId);
  const updateReq = event.body;
  console.log('CURRENTORDER: ', currentOrder);

  if (orderId) {
    let result = {};

    if (updateReq.changeRoomId && updateReq.newRoomId) {
      const allRooms = await getAllRooms();
      let updatedRooms = [];

      const currentOrderWithout = currentOrder.roomsBooked.filter(
        r.sk !== updateReq.changeRoomId
      );
    }

    // Om användaren skickar med nights i bodyn
    if (updateReq.nights) {
      const updatedNights = await updateNumberOfNights(
        updateReq.nights,
        orderId
      );
      // Lägger in ändringen i result
      result = { ...result, ...updatedNights };
    }
    // Om användaren skickar med ny antal gäster i bodyn
    if (updateReq.guests) {
      const updatedGuests = await updateNumberOfGuests(
        updateReq.guests,
        orderId
      );
      // Lägger in ändringen i result
      result = { ...result, ...updatedGuests };
    }
    return sendResponses(200, {
      success: true,
      updatedOrder: result,
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

import middy from '@middy/core';
import { sendResponses } from '../../responses/index.mjs';
import { errorHandler } from '../../middelwares/errorHandler.mjs';
import { validateOrderId } from '../../middelwares/validateOrderId.mjs';
import { updateOrder, getOrderById } from '../../services/orders.mjs';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { getAllRooms, getRoomById } from '../../services/rooms.mjs';
import { validatePutOrderById } from '../../middelwares/validatePutOrderById.mjs';
export const handler = middy(async (event) => {
  const { orderId } = event.pathParameters || {};
  let currentOrder = await getOrderById(orderId);
  const updateReq = event.body;

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
      currentOrder.roomsBooked = currentOrder.roomsBooked.filter(
        (r) => r.sk !== updateReq.changeRoomId
      );
      // Lägger till det nya rummet i listan
      let newRoom = await getRoomById(updateReq.newRoomId);
      currentOrder.roomsBooked.push(newRoom);
    }

    if (updateReq.guests) {
      // Kontroll att det inte är fler gäster än sängar
      let numberOfBeds = 0;
      let price = 0;

      currentOrder.roomsBooked.forEach((room) => {
        numberOfBeds += room.beds;
        price += room.price;
      });

      if (updateReq.guests > numberOfBeds) {
        return sendResponses(400, {
          success: false,
          message: `Can't order rooms with fewer beds than there are guests.`,
        });
      } else {
        currentOrder.numberOfGuests = updateReq.guests;
        currentOrder.price = price;
      }
    }

    if (updateReq.nights) currentOrder.numberOfNights = updateReq.nights;

    const result = await updateOrder(currentOrder, orderId);
    if (result) {
      return sendResponses(200, {
        success: true,
        updatedOrder: result,
      });
    }
  } else {
    return sendResponses(400, {
      success: false,
      message: 'Could not find order',
    });
  }
})
  .use(httpJsonBodyParser())
  .use(validateOrderId())
  .use(validatePutOrderById())
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

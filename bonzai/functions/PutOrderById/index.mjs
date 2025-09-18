import middy from '@middy/core';
import { sendResponses } from '../../responses/index.mjs';
import { errorHandler } from '../../middelwares/errorHandler.mjs';
import { validateOrderId } from '../../middelwares/validateOrderId.mjs';
import { updateOrder, getOrderById } from '../../services/orders.mjs';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import {
  getAllRooms,
  getRoomById,
  toggleAvailableRoom,
} from '../../services/rooms.mjs';
import { validatePutOrderById } from '../../middelwares/validatePutOrderById.mjs';
export const handler = middy(async (event) => {
  const { orderId } = event.pathParameters || {};
  let currentOrder = await getOrderById(orderId);
  const updateReq = event.body;

  if (currentOrder) {
    // Hämtar hem alla rum
    const allRooms = await getAllRooms();

    // Om användare endast vill lägga till ett rum
    if (updateReq.newRoomId) {
      // Kontroll om newRoomId finns med i alla rum
      const newRoomExists = allRooms.some((r) => r.sk === updateReq.newRoomId);
      // Kontroll om newRoom är available
      const isNewRoomAvailable = allRooms.some(
        (r) => r.sk === updateReq.newRoomId && r.available === true
      );
      if (!newRoomExists) {
        return sendResponses(400, {
          success: false,
          message: 'Invalid id of newRoomId',
        });
      }
      // Om newRoomId inte är available
      else if (!isNewRoomAvailable) {
        return sendResponses(400, {
          success: false,
          message: 'Choice of new room is not available',
        });
      }
      // Hämtar hem rumsobjektet och lägger in den i roomsBooked-arr
      let newRoom = await getRoomById(updateReq.newRoomId);
      currentOrder.roomsBooked.push(newRoom);

      // Kontroll att det inte är fler gäster än sängar
      if (updateReq.guests) {
        let numberOfBeds = 0;

        currentOrder.roomsBooked.forEach((room) => {
          numberOfBeds += room.beds;
        });

        if (updateReq.guests > numberOfBeds) {
          return sendResponses(400, {
            success: false,
            message: `Can't order rooms with fewer beds than there are guests.`,
          });
        } else {
          currentOrder.numberOfGuests = updateReq.guests;
        }
      } else {
        return sendResponses(400, {
          success: false,
          message: `You have to put in total of guest for this order`,
        });
      }
    }

    if (updateReq.changeRoomId) {
      // Kontroll om changeRoomId finns med i alla rum
      const changeRoomExists = currentOrder.roomsBooked.some(
        (r) => r.sk === updateReq.changeRoomId
      );
      // Om changeRoomId inte finns med i listan av alla rum
      if (!changeRoomExists) {
        return sendResponses(400, {
          success: false,
          message: 'ChangeRoomId does not exist in current order',
        });
      }

      // Här tas det rum man vill byta bort från roomsBooked-arr
      currentOrder.roomsBooked = currentOrder.roomsBooked.filter(
        (r) => r.sk !== updateReq.changeRoomId
      );
    }

    // Om användaren vill ändra antal nätter för hela ordern
    if (updateReq.nights) {
      // Uppdaterar totalsumman för hela ordern
      let totalRoomPrice = 0;

      currentOrder.roomsBooked.forEach((room) => {
        totalRoomPrice += room.price * updateReq.nights;
      });
      currentOrder.price = totalRoomPrice;
      // Ändrar om antal nätter till det nya antalet
      currentOrder.numberOfNights = updateReq.nights;
    }

    const result = await updateOrder(currentOrder, orderId);
    if (result) {
      await toggleAvailableRoom(updateReq.changeRoomId, true);
      await toggleAvailableRoom(updateReq.newRoomId, false);
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

// HITTADE BUGGAR
// När man kör postOrder så ska även orderId följa med tillbaka
// Totalpris ska det även vara när man kör postOrder, nu läggs inte alla pengar ihop
// Vad händer när man tar bort changeRoomId så att roomsBooked blir tom?

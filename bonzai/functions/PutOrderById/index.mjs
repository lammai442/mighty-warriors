import middy from '@middy/core';
import { sendResponses } from '../../responses/index.mjs';
import { errorHandler } from '../../middlewares/errorHandler.mjs';
import { validateOrderId } from '../../middlewares/validateOrderId.mjs';
import { updateOrder, getOrderById } from '../../services/orders.mjs';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { getAllRooms, toggleAvailableRoom } from '../../services/rooms.mjs';
import { validatePutOrderById } from '../../middlewares/validatePutOrderById.mjs';
import {
  validateBeds,
  validateRoomId,
  validateRooms,
} from '../../utils/validators.mjs';
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
      let newRoom = validateRoomId(allRooms, updateReq.newRoomId);

      if (!newRoom) {
        return sendResponses(404, {
          success: false,
          message: `Room with ID: ${updateReq.newRoomId} doesn't exist`,
        });
      }

      if (newRoom.available === false) {
        return sendResponses(404, {
          success: false,
          message: `Choice of room with ID: ${updateReq.newRoomId} is not available`,
        });
      }

      // Lägger upp nya rummet i roomsBooked
      currentOrder.roomsBooked.push(newRoom);
    }

    // Om användaren skickar med att den vill byta rum från
    if (updateReq.removeRoomId) {
      // Kontroll om removeRoomId finns med i alla rum
      const changeRoomExists = currentOrder.roomsBooked.some(
        (r) => r.sk === updateReq.removeRoomId
      );
      // Om removeRoomId inte finns med i listan av alla rum
      if (!changeRoomExists) {
        return sendResponses(400, {
          success: false,
          message: 'removeRoomId does not exist in current order',
        });
      }

      // Här tas det rum man vill byta bort från roomsBooked-arr
      const updatedRoomsBooked = currentOrder.roomsBooked.filter(
        (r) => r.sk !== updateReq.removeRoomId
      );
      if (updatedRoomsBooked.length < 1) {
        return sendResponses(400, {
          success: false,
          message: 'Your order must include a least one room',
        });
      }
      // Ersätter med den nya roomsBooked-arr
      currentOrder.roomsBooked = updatedRoomsBooked;
    }
    // _______________
    // Kontroll att det inte är fler gäster än sängar
    // let numberOfBeds = 0;

    // currentOrder.roomsBooked.forEach((room) => {
    //   numberOfBeds += room.beds;
    // });

    // if (updateReq.numberOfGuests > numberOfBeds) {
    //   return sendResponses(400, {
    //     success: false,
    //     message: `Can't order rooms with fewer beds than there are guests.`,
    //   });
    // }

    // if (updateReq.numberOfGuests)
    //   currentOrder.numberOfGuests = updateReq.numberOfGuests;

    // if (currentOrder.roomsBooked.length > currentOrder.numberOfGuests) {
    //   return sendResponses(400, {
    //     success: false,
    //     message: `Can't order more rooms than there are guests.`,
    //   });
    // }
    // ___________

    if (!validateBeds(currentOrder, updateReq.numberOfGuests)) {
      return sendResponses(400, {
        message: `Can't order rooms with fewer beds than there are guests.`,
      });
    }

    if (!validateRooms(currentOrder)) {
      return sendResponses(400, {
        success: false,
        message: `Can't order more rooms than there are guests.`,
      });
    }

    if (updateReq.numberOfNights)
      currentOrder.numberOfNights = parseInt(updateReq.numberOfNights);

    // Uppdaterar totalsumman för hela ordern
    let totalRoomPrice = 0;

    currentOrder.roomsBooked.forEach((room) => {
      totalRoomPrice += room.price * currentOrder.numberOfNights;
    });

    currentOrder.totalPrice = totalRoomPrice;

    // Gör anrop till databasen och skickar med den reviderade currentOrder beroende på req
    const result = await updateOrder(currentOrder, orderId);

    if (result) {
      // Om allt fungerar så togglas rummens status ifall de finns i req
      if (updateReq.removeRoomId)
        await toggleAvailableRoom(updateReq.removeRoomId, true);
      if (updateReq.newRoomId)
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

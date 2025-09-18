import { sendResponses } from '../responses/index.mjs';

export const validateBeds = (currentOrder, reqGuests) => {
  // Kontroll att det inte är fler gäster än sängar
  if (reqGuests) currentOrder.numberOfGuests = reqGuests;

  let numberOfBeds = 0;

  currentOrder.roomsBooked.forEach((room) => {
    numberOfBeds += room.beds;
  });

  if (currentOrder.numberOfGuests > numberOfBeds) {
    return false;
  }
  return true;
};

export const validateRooms = (currentOrder) => {
  // Kontroll att det inte är fler rum än gäster
  if (currentOrder.roomsBooked.length > currentOrder.numberOfGuests) {
    return false;
  }
  return true;
};

export const validateRoomId = (allRooms, roomId) => {
  const room = allRooms.find((r) => r.sk.includes(roomId));

  if (room === undefined) {
    return false;
  }
  return room;
};

export const validateIsRoomAvailable = (room) => {
  if (room.available === false) return false;
  return true;
};

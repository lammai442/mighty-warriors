import { sendResponses } from '../../responses/index.mjs';
import middy from '@middy/core';
import { addRoom } from '../../services/rooms.mjs';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { errorHandler } from '../../middlewares/errorHandler.mjs';
import { validateRoom } from '../../middlewares/validateRoom.mjs';

export const handler = middy(async (event) => {
  const result = await addRoom(event.body);

  if (result) {
    return sendResponses(201, {
      success: true,
      message: 'Room added successfully',
    });
  } else {
    return sendResponses(400, {
      succes: false,
      message: 'Room could not be added',
    });
  }
})
  .use(httpJsonBodyParser())
  .use(validateRoom())
  .use(errorHandler());

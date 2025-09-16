import { sendResponses } from '../../responses/index.mjs';
import middy from '@middy/core';
import { errorHandler } from '../../middelwares/errorHandler.mjs';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { validateOrder } from '../../middelwares/validateOrder.mjs';

export const handler = middy(async (event) => {
  const newOrder = event.body;

  // Need to get current rooms. Need to run GET on /api/rooms

  // Verification whether all rooms are available

  // Verification against number of guests versus number of beds

  // Adjust the rooms' availability "true/false"

  // Create a new order with unique orderId

  return sendResponses(201, {
    message: 'Successfully created order',
    newOrder,
  });
})
  .use(httpJsonBodyParser())
  .use(validateOrder())
  .use(errorHandler());

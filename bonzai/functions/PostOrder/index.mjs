import { sendResponses } from '../../responses/index.mjs';
import middy from '@middy/core';
import { errorHandler } from '../../middelwares/errorHandler.mjs';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { validateOrder } from '../../middelwares/validateOrder.mjs';

export const handler = middy(async (event) => {
  const newOrder = event.body;
  return sendResponses(201, {
    message: 'Successfully created order',
    newOrder,
  });
})
  .use(httpJsonBodyParser())
  .use(validateOrder())
  .use(errorHandler());

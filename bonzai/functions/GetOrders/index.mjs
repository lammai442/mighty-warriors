import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { sendResponses } from '../../responses/index.mjs';
import { errorHandler } from '../../middelwares/errorHandler.mjs';
import { getOrders } from '../../services/orders.mjs';

export const handler = middy(async (event) => {
  const { orderId } = event.pathParameter;
  const result = await getOrders(orderId ? orderId : '');
  if (result) {
    return sendResponses(200, { success: true, orders: result });
  } else {
    return sendResponses(400, {
      success: false,
      message: 'Could not find orders',
    });
  }
})
  .use(httpJsonBodyParser())
  .use(errorHandler());

// Som receptionist vill jag kunna se alla bokningar som gjorts för att få en överblick över hur beläggningen av hotellet ser ut.

// API endpoint: /api/orders/{orderID}

// GET ordrar

// Följande ska man kunna se om varje bokning:

// Bokningsnummer
// In-och utcheckningsdatum
// Antal gäster
// Antalet rum
// Namn på den som bokade rummet

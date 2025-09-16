import middy from '@middy/core';
import { sendResponses } from '../../responses/index.mjs';
import { errorHandler } from '../../middelwares/errorHandler.mjs';
import { validateOrderId } from '../../middelwares/validateOrderId.mjs';
import { editOrder } from '../../services/orders.mjs';
import httpJsonBodyParser from '@middy/http-json-body-parser';

export const handler = middy(async (event) => {
  const { orderId } = event.pathParameters || {};
  const updates = event.body;

  if (orderId) {
    const result = await editOrder(updates, orderId);
    return sendResponses(200, { success: true, updatedOrder: result });
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

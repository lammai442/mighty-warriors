import { client } from './client.mjs';
import {
  QueryCommand,
  UpdateItemCommand,
  PutItemCommand,
  GetItemCommand,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb';
import { unmarshall, marshall } from '@aws-sdk/util-dynamodb';
import { generateDate } from '../utils/generateDate.mjs';
import { generateId } from '../utils/generateId.mjs';

export const getAllOrders = async () => {
  const command = new QueryCommand({
    TableName: 'bonzai-db',
    KeyConditionExpression: 'pk= :pk AND begins_with(sk, :sk)',
    ExpressionAttributeValues: {
      ':pk': { S: 'ORDER' },
      ':sk': { S: 'ORDER#' },
    },
  });

  try {
    const data = await client.send(command);
    if (!data.Items || data.Items.length === 0) return [];

    const orders = data.Items.map((item) => unmarshall(item));
    return orders;
  } catch (error) {
    console.log('ERROR in orders-db', error.message);
    return false;
  }
};

// export const getOneOrder = async (orderId) => {
//   const command = new QueryCommand({
//     TableName: 'bonzai-db',
//     KeyConditionExpression: 'pk= :pk AND begins_with(sk, :sk)',
//     ExpressionAttributeValues: {
//       ':pk': { S: 'ORDER' },
//       ':sk': { S: `ORDER#${orderId}` },
//     },
//   });

//   try {
//     const { Items } = await client.send(command);
//     const orders = Items.map((item) => unmarshall(item));
//     return orders;
//   } catch (error) {
//     console.log('ERROR in orders-db', error.message);
//     return false;
//   }
// };

export const getOrderById = async (orderId) => {
  const command = new GetItemCommand({
    TableName: 'bonzai-db',
    Key: {
      pk: { S: 'ORDER' },
      sk: { S: `ORDER#${orderId}` },
    },
  });

  try {
    const { Item } = await client.send(command);
    return unmarshall(Item);
  } catch (error) {
    console.log('ERROR in db', error.message);
    return false;
  }
};

export const createOrder = async (orderRequest) => {
  // Bestämmer vad objektet man vill skicka in ska innehålla
  const order = {
    pk: 'ORDER',
    sk: generateId('ORDER'),
    numberOfNights: orderRequest.nights,
    numberOfGuests: orderRequest.guests,
    bookedBy: orderRequest.name,
    // orderRequest.rooms är en array av objekt som innehåller rummen
    roomsBooked: orderRequest.rooms,
    price: orderRequest.price,
    createdAt: generateDate(),
  };

  // "marshall(order)" ser till att objektet följer systemet med { S: } { N: } osv.
  const params = {
    TableName: 'bonzai-db',
    Item: marshall(order),
  };

  try {
    // Bara att skicka in params efteråt
    const result = await client.send(new PutItemCommand(params));
    return result;
  } catch (error) {
    console.log('ERROR in db', error.message);
    return false;
  }
};

export const deleteOrder = async (orderId) => {
  const command = new DeleteItemCommand({
    TableName: 'bonzai-db',
    Key: {
      pk: { S: 'ORDER' },
      sk: { S: `ORDER#${orderId}` },
    },
    ReturnValues: 'ALL_OLD',
  });

  try {
    const result = await client.send(command);
    return result;
  } catch (error) {
    console.log('ERROR in db', error.message);
    return false;
  }
};

// export const updateOrder = async (updates, orderId) => {
//   const command = new UpdateItemCommand({
//     TableName: 'bonzai-db',
//     Key: { pk: { S: 'ORDER' }, sk: { S: `ORDER#${orderId}` } },
//     UpdateExpression:
//       'SET #numberOfGuests = :numberOfGuests, #numberOfNights = :numberOfNights, #modifiedAt = :modifiedAt, #roomsBooked = :roomsBooked',
//     ExpressionAttributeNames: {
//       '#numberOfGuests': 'numberOfGuests',
//       '#numberOfNights': 'numberOfNights',
//       '#modifiedAt': 'modifiedAt',
//       '#roomsBooked': 'roomsBooked'
//     },
//     ExpressionAttributeValues: {
//       ':numberOfGuests': {
//         N: updates.numberOfGuests
//           ? updates.numberOfGuest.toString()
//           : 'numberOfGuests',
//       },
//       ':numberOfNights': { N: updates.numberOfNights.toString() },
//       ':modifiedAt': { S: generateDate() },
//       ':roomsBooked':
//     },

//     ReturnValues: 'UPDATED_NEW',
//   });
//   try {
//     const result = await client.send(command);
//     return unmarshall(result.Attributes);
//   } catch (error) {
//     console.log('Error in PutOrderById-db', error.message);
//   }
// };

export const updateOrder = async (updates, orderId) => {
  // Dynamiskt bygg ExpressionAttributes och UpdateExpression
  const ExpressionAttributeNames = {};
  const ExpressionAttributeValues = {};
  const setExpressions = [];

  if (updates.numberOfGuests !== undefined) {
    ExpressionAttributeNames['#numberOfGuests'] = 'numberOfGuests';
    ExpressionAttributeValues[':numberOfGuests'] = {
      N: updates.guests.toString(),
    };
    setExpressions.push('#numberOfGuests = :numberOfGuests');
  }

  if (updates.numberOfNights !== undefined) {
    ExpressionAttributeNames['#numberOfNights'] = 'numberOfNights';
    ExpressionAttributeValues[':numberOfNights'] = {
      N: updates.nights.toString(),
    };
    setExpressions.push('#numberOfNights = :numberOfNights');
  }

  if (updates.roomsBooked !== undefined) {
    ExpressionAttributeNames['#roomsBooked'] = 'roomsBooked';
    ExpressionAttributeValues[':roomsBooked'] = {
      L: updates.rooms.map((r) => ({ S: r })),
    };
    setExpressions.push('#roomsBooked = :roomsBooked');
  }

  // alltid uppdatera modifiedAt
  ExpressionAttributeNames['#modifiedAt'] = 'modifiedAt';
  ExpressionAttributeValues[':modifiedAt'] = { S: generateDate() };
  setExpressions.push('#modifiedAt = :modifiedAt');

  const command = new UpdateItemCommand({
    TableName: 'bonzai-db',
    Key: { pk: { S: 'ORDER' }, sk: { S: `ORDER#${orderId}` } },
    UpdateExpression: `SET ${setExpressions.join(', ')}`,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
    ReturnValues: 'UPDATED_NEW',
  });

  try {
    const result = await client.send(command);
    return unmarshall(result.Attributes);
  } catch (error) {
    console.log('Error in updateOrder-db', error.message);
    throw error;
  }
};

export const updateNumberOfNights = async (amount, orderId) => {
  const command = new UpdateItemCommand({
    TableName: 'bonzai-db',
    Key: { pk: { S: 'ORDER' }, sk: { S: `ORDER#${orderId}` } },
    UpdateExpression:
      'SET #numberOfNights = :numberOfNights, #modifiedAt = :modifiedAt',
    ExpressionAttributeNames: {
      '#numberOfNights': 'numberOfNights',
      '#modifiedAt': 'modifiedAt',
    },
    ExpressionAttributeValues: {
      ':numberOfNights': { N: amount.toString() },
      ':modifiedAt': { S: generateDate() },
    },

    ReturnValues: 'UPDATED_NEW',
  });

  try {
    const result = await client.send(command);
    return unmarshall(result.Attributes);
  } catch (error) {
    console.log('Error in PutOrderById-db', error.message);
  }
};
export const updateNumberOfGuests = async (amount, orderId) => {
  const command = new UpdateItemCommand({
    TableName: 'bonzai-db',
    Key: { pk: { S: 'ORDER' }, sk: { S: `ORDER#${orderId}` } },
    UpdateExpression:
      'SET #numberOfGuests = :numberOfGuests, #modifiedAt = :modifiedAt',
    ExpressionAttributeNames: {
      '#numberOfGuests': 'numberOfGuests',
      '#modifiedAt': 'modifiedAt',
    },
    ExpressionAttributeValues: {
      ':numberOfGuests': { N: amount.toString() },
      ':modifiedAt': { S: generateDate() },
    },

    ReturnValues: 'UPDATED_NEW',
  });

  try {
    const result = await client.send(command);
    return unmarshall(result.Attributes);
  } catch (error) {
    console.log('Error in PutOrderById-db', error.message);
    return false;
  }
};

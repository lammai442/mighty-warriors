import { client } from './client.mjs';
import { QueryCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { generateDate } from '../utils/generateDate.mjs';
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

export const getOneOrder = async (orderId) => {
  const command = new QueryCommand({
    TableName: 'bonzai-db',
    KeyConditionExpression: 'pk= :pk AND begins_with(sk, :sk)',
    ExpressionAttributeValues: {
      ':pk': { S: 'ORDER' },
      ':sk': { S: `ORDER#${orderId}` },
    },
  });

  try {
    const { Items } = await client.send(command);
    const orders = Items.map((item) => unmarshall(item));
    return orders;
  } catch (error) {
    console.log('ERROR in orders-db', error.message);
    return false;
  }
};

export const editOrder = async (updates, orderId) => {
  const command = new UpdateItemCommand({
    TableName: 'bonzai-db',
    Key: { pk: { S: 'ORDER' }, sk: { S: `ORDER#${orderId}` } },
    UpdateExpression:
      'SET #numberOfGuests = :numberOfGuests, #numberOfNights = :numberOfNights, #modifiedAt = :modifiedAt',
    ExpressionAttributeNames: {
      '#numberOfGuests': 'numberOfGuests',
      '#numberOfNights': 'numberOfNights',
      '#modifiedAt': 'modifiedAt',
      // '#hiredRooms': 'hiredRooms',
    },
    ExpressionAttributeValues: {
      ':numberOfGuests': {
        N: updates.numberOfGuests
          ? updates.numberOfGuest.toString()
          : 'numberOfGuests',
      },
      ':numberOfNights': { N: updates.numberOfNights.toString() },
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
  }
};

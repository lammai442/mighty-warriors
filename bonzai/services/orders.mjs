import { client } from './client.mjs';
import { QueryCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

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

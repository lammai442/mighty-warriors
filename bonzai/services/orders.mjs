import { client } from './client.mjs';
import { GetItemCommand } from '@aws-sdk/client-dynamodb';

export const getOrders = (orderId) => {
  const command = GetItemCommand({
    TableName: 'bonzai-db',
    Key: {
        pk: 'ORDER',
        sk: 
    }
  });
};

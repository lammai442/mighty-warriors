import { client } from './client.mjs';
import {
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { generateId } from '../utils/generateId.mjs';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export const addRoom = async (room) => {
  console.log('room:', room);
  const id = `ROOM#${generateId(room.type)}`;
  console.log('id: ', id);

  const command = new PutItemCommand({
    TableName: 'bonzai-db',
    Item: {
      pk: { S: 'ROOM' },
      sk: { S: id },
      available: { BOOL: room.available },
      beds: { N: room.beds.toString() },
      price: { N: room.price.toString() },
      createdAt: { S: new Date().toISOString() },
    },
  });

  try {
    await client.send(command);
    return true;
  } catch (error) {
    console.log('ERROR from rooms-db', error.message);
    return false;
  }
};

export const getAllRooms = async () => {
  const command = new QueryCommand({
    TableName: 'bonzai-db',
    KeyConditionExpression: 'pk= :pk AND begins_with(sk, :sk)',
    ExpressionAttributeValues: {
      ':pk': { S: 'ROOM' },
      ':sk': { S: 'ROOM' },
    },
  });

  try {
    const { Items } = await client.send(command);
    const rooms = Items.map((item) => unmarshall(item));
    return rooms;
  } catch (error) {
    console.log('ERROR in db', error.message);
    return false;
  }
};
export const getAvailableRooms = async () => {
  const command = new QueryCommand({
    TableName: 'bonzai-db',
    KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
    ExpressionAttributeValues: {
      ':pk': { S: 'ROOM' },
      ':sk': { S: 'ROOM' },
      ':available': { BOOL: true },
    },
    FilterExpression: 'available = :available',
  });

  try {
    const { Items } = await client.send(command);
    const rooms = Items.map((item) => unmarshall(item));
    return rooms;
  } catch (error) {
    console.log('ERROR in db', error.message);
    return false;
  }
};

export const getRoomById = async (roomID) => {
  const command = new GetItemCommand({
    TableName: 'bonzai-db',
    Key: {
      pk: { S: 'ROOM' },
      sk: { S: roomID },
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

export const toggleAvailableRoom = async (roomID, newValue) => {
  const command = new UpdateItemCommand({
    TableName: 'bonzai-db',
    Key: {
      pk: { S: 'ROOM' },
      sk: { S: roomID },
    },
    UpdateExpression: 'SET #available = :toggled',
    ExpressionAttributeNames: { '#available': 'available' },
    ExpressionAttributeValues: { ':toggled': { BOOL: newValue } },
    ReturnValues: 'UPDATED_NEW',
  });

  try {
    const result = await client.send(command);
    return unmarshall(result.Attributes);
  } catch (error) {
    console.log('ERROR in db', error.message);
    return false;
  }
};

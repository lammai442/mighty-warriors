import { client } from './client.mjs';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { generateId } from '../utils/generateId.mjs';
export const addRoom = async (room) => {
	const command = new PutItemCommand({
		TableName: 'bonzai-db',
		Item: {
			pk: { S: `${generateId('ROOM')}` },
			sk: { S: `ROOM-${room.type}` },
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

import { sendResponses } from '../../responses/index.mjs';
import middy from '@middy/core';
import { addRoom } from '../../services/rooms.mjs';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { errorHandler } from '../../middelwares/errorHandler.mjs';
export const handler = middy(async (event) => {
	const result = await addRoom(event.body);

	if (result) {
		return sendResponses(201, {
			success: true,
			message: 'Room added successfylly',
		});
	} else {
		return sendResponses(400, {
			succes: false,
			message: 'Room could not be added',
		});
	}
	return sendResponses(200, { message: 'success' });
})
	.use(httpJsonBodyParser())
	.use(errorHandler());

import { sendResponses } from '../../responses/index.mjs';

export const handler = async (event) => {
	return sendResponses(200, { message: 'success' });
};

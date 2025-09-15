import { sendResponses } from '../responses/index.mjs';

export const errorHandler = () => ({
	onError: (handler) => {
		handler.response = sendResponses(400, {
			message: handler.error.message,
		});
	},
});

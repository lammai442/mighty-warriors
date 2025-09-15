export const sendResponses = (status, body) => {
	return {
		statusCode: status,
		body: JSON.stringify({ ...body }),
	};
};

export const generateErrorMsg = (handler) => {
  if (handler.error.message === 'Unsupported Media Type')
    return 'Include body in request';
  else return handler.error.message;
};

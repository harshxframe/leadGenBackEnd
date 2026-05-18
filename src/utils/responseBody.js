export function responseBody( error, success, code, message, data) {
  return {
    error: error,
    success: success,
    code: code,
    message: message,
    data: data,
    timeStamp: new Date().toISOString()
  };
}

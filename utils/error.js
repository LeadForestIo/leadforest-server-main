module.exports = (msg, statusCode = 400) => {
  const e = new Error(msg || `Not found`);
  e.isSuccess = false;
  e.status = statusCode;
  return e;
};
/**
 * error format
 * e.message
    e.status
 */

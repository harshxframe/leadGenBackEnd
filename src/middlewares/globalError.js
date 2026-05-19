import { responseBody } from "../utils/responseBody.js";
import logger from "../utils/logger.js";

export const globalErrorHandler = (err, req, res, next) => {
  logger.error(`Server Error: ${err}`);
  return res
    .status(500)
    .send(responseBody(true, false, 500, `Server Error: ${err}`, {}));
};

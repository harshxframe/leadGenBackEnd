import { responseBody } from "../utils/responseBody.js";

export const invalidRoute = (req, res) => {
  return res
    .status(400)
    .send(responseBody(true, false, 400, "Invalid route", {}));
};

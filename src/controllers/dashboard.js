import { responseBody } from "../utils/responseBody.js";
import { readToken } from "../utils/jwt.js";

export const getStatus = async (req, res) => {
  try {
    const { token } = req.body || {};
    if (!token) {
      return res
        .status(400)
        .send(responseBody(true, false, 400, "Payload not satisfied", {}));
    }

    // Get token
    const getId = readToken(token);
    if (!getId) {
      return res
        .status(403)
        .send(responseBody(true, false, 403, "Invalid token", {}));
    }
    const isSuccess = await getUserService(getId.id);






    
  } catch (e) {
    return res
      .status(500)
      .send(responseBody(true, false, 500, e.message || "Server Error", {}));
  }
};

import { responseBody } from "../utils/responseBody.js";
import { readToken } from "../utils/jwt.js";

export const userAuthentication = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const { token } = req.body || {};

    const getId = readToken(token);

    if (getId) {
      // Put the bearer token in the body
      req.body.userId = getId?.id;
    } else {
      return res
        .status(401)
        .send(
          responseBody(true, false, 401, "Invalid authentication request", {}),
        );
    }

    next();
  } catch (e) {
    return res
      .status(401)
      .send(
        responseBody(true, false, 401, "Invalid authentication request", {}),
      );
  }
};

// const { userId } = req.body;

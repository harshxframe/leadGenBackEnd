import { responseBody } from "../utils/responseBody.js";

export const validateAPIRequest = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if the header exists and starts with "Bearer "
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      // Ensure req.body is an object before appending to prevent crashes
      req.body =
        typeof req.body === "object" && req.body !== null ? req.body : {};

      // Put the bearer token in the body
      req.body.bearerToken = token;
    } else {
      res
        .status(401)
        .send(
          responseBody(
            true,
            false,
            401,
            "Invalid API request authentication",
            {},
          ),
        );
    }

    next();
  } catch (e) {
    res
      .status(401)
      .send(
        responseBody(
          true,
          false,
          401,
          "Invalid API request authentication",
          {},
        ),
      );
  }
};

// const { bearerToken } = req.body;

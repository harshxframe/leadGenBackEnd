import crypto from "crypto";
import { responseBody } from "../utils/responseBody.js";
import logger from "../utils/logger.js";

export const lemonSqueezyAuth = async (req, res, next) => {
  try {
    const signature = req.headers["x-signature"];

    if (!signature) {
      return res.status(401).send(
        responseBody(true, false, 401, "Missing signature", {})
      );
    }

    // Ensure rawBody middleware was set up correctly in app.js
    if (!req.rawBody) {
      logger.error("Error: req.rawBody is missing. Check your express.json() configuration.");
      return res.status(500).send(
        responseBody(true, false, 500, "Server configuration error", {})
      );
    }

    logger.info("Signature from header:", signature);

    // Compute the hash using the RAW body buffer instead of stringified JSON
    const digest = crypto
      .createHmac("sha256", process.env.LEMON_SQUEEZY_SIGNING_WEBHOOK_SECRET)
      .update(req.rawBody) 
      .digest("hex");

    logger.info("Computed digest:", digest);

    // Turn both strings into equal-length buffers to avoid timing attacks
    const incomingBuffer = Buffer.from(signature, "utf8");
    const expectedBuffer = Buffer.from(digest, "utf8");

    // Use timingSafeEqual to check authenticity safely
    if (
      incomingBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(incomingBuffer, expectedBuffer)
    ) {
      return res.status(401).send(
        responseBody(true, false, 401, "Invalid webhook signature", {})
      );
    }

    next();
  } catch (e) {
    logger.error(e);

    return res.status(401).send(
      responseBody(true, false, 401, "Invalid authentication request", {})
    );
  }
};

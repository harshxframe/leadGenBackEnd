import { createClient } from "redis";
import dotenv from "dotenv";
import logger from "../utils/logger.js";

const host = process.env.REDIS_HOST || "localhost";
const port = process.env.REDIS_PORT || 6379;

const otpKey = (email) =>{
  return `korexbase:sessions:${email}`;
}

const platformSettingsKey = () =>{
  return `korexbase:platformSettings:settings`;
}

const redisConnection = {
  port:port,
  host:host
}

const configuration = {
  attempts: 1,
  backoff: { type: "exponential", delay: 2000 },
  removeOnComplete: true,
  removeOnFail: true,
}; // configuration for Queue Worker


const client = createClient({
  socket: {
    host: host,
    port: port,
    reconnectStrategy: (retries) => {
      if (retries >= 5) {       
        logger.error("Redis reconnection maximum retries exceeded. Stopping attempts.")
        return new Error("Max retries reached");
      }
      logger.info(`Redis reconnect attempt #${retries}. Retrying in 2 seconds...`)
      return 2000;
    },
  },
});

const retry = 0;

client.on("error", (err) => {
  logger.error("Redis Client Error:", err);
});

client.on("connect", () => {
  logger.info("Redis client initiating connection to server...");
});

client.on("ready", () => {
  logger.info("Redis client connected and ready to use!");
});

client.on("end", () => {
  logger.info("Redis connection closed.");
});

client.on("reconnecting", () => {
  logger.info("Redis client attempting to reconnect...");
});

export { client, otpKey, platformSettingsKey, redisConnection, configuration};

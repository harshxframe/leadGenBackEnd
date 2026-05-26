import mongoose from "mongoose";
import logger from "../utils/logger.js";

export const connectDB = async () => {
  const dbUrl = process.env.MONGO_URI_PRIMARY;
  if (!dbUrl) throw new Error("!DB url not found");
  try {
    await mongoose.connect(dbUrl);
    logger.info(`Database connection successfull`);
  } catch (e) {
    logger.error(`Failed to connect database! ${e.message}`);
  }
};

import express from "express";
import generateLeadsRouter from "./routes/generateLeads.js";
import dotenv from "dotenv";
import { connectDB } from "./config/databaseConnection.js";
import logger from "./utils/logger.js";
import { invalidRoute } from "./middlewares/invalidRoute.js";
import { systemHealthMiddleware } from "./middlewares/health.js";
import { globalErrorHandler } from "./middlewares/globalError.js";
import authRouter from "./routes/auth.js";
import adminRouter from "./routes/admin.js";
import {
  checkMaintenance,
  checkNewRequest,
} from "./middlewares/accessValidator.js";
import { connectRedis } from "./config/redisConfig.js";
import cors from "cors";
import dashbaordRouter from "./routes/dashboard.js";
dotenv.config();

const initApp = async () => {
  try {
    await connectDB();
    await connectRedis();
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use("/admin", adminRouter);
    app.use(checkNewRequest);
    app.use(checkMaintenance);
    app.use("/app/v1/auth", authRouter);
    app.use("/app/v1/dashboard", dashbaordRouter);
    app.use("/app/v1", generateLeadsRouter);
    app.get("/health", systemHealthMiddleware);
    app.use(invalidRoute);
    app.use(globalErrorHandler);
    return app;
  } catch (e) {
    logger.error("Failed to boot Server", e);
    process.exit(0);
  }
};

export default initApp;

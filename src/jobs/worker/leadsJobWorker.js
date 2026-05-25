import { Worker } from "bullmq";
import mongoose from "mongoose";
import { env } from "../../config/env.js";
import logger from "../../utils/logger.js";
import { withTimeOut } from "../../utils/withTimeOut.js";
import { fetchBusinessLeads } from "../../services/leadGenerator.service.js";
import { getItemsinLimit } from "../../utils/getRequestAmountOfLead.js";
import { buildFinalLeads } from "../../utils/leadsFilter.js";
import { leadsWorkerProcessor } from "../../services/LeadsWorkerProcessor.js";

const DBConnectionUrl = env.MONGO_URI;
// 1. Register listeners ONCE at the top level
mongoose.connection.on("connected", () =>
  logger.info("DB connection successful with DB worker"),
);
mongoose.connection.on("error", (err) =>
  logger.error("Error in DB connection in DB worker", { error: err.message }),
);
mongoose.connection.on("disconnected", () =>
  logger.info("DB disconnected with DB worker"),
);

async function LeadsJobWorker() {
  try {
    await mongoose.connect(DBConnectionUrl, {
      maxPoolSize: 10, // Adjust this based on your workerConcurreny
    });
    logger.error("Started, Leads Job Worker", { error: e });
    const worker = new Worker("lead-job-queue", leadsWorkerProcessor);

    worker.on("completed", async (job) => {});

    worker.on("error", async (job) => {});

    worker.on("failed", async (job) => {});
  } catch (e) {
    logger.error("Failed to start Leads Job Worker", { error: e });
  }
}

import { Worker } from "bullmq";
import mongoose from "mongoose";
import { env } from "../../config/env.js";
import logger from "../../utils/logger.js";
import { withTimeOut } from "../../utils/withTimeOut.js";
import { fetchBusinessLeads } from "../../services/leadGenerator.service.js";
import { getItemsinLimit } from "../../utils/getRequestAmountOfLead.js";
import { buildFinalLeads } from "../../utils/leadsFilter.js";
import { leadsWorkerProcessor } from "../../services/LeadsWorkerProcessor.js";
import { updateLeadsStatus } from "../../services/databaseService.js";
import { connectRedis, redisConnection } from "../../config/redisConfig.js";
import { getAdminSettings } from "../../services/redisService.js";

const MONGO_DB_URI = String(env.MONGO_URI_PRIMARY);

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
    await mongoose.connect(MONGO_DB_URI, {
      maxPoolSize: 10, // Adjust this based on your workerConcurreny
    });
    await connectRedis();

    logger.info("Started, Leads Job Worker");
    const worker = new Worker("lead-job-queue", leadsWorkerProcessor, {
      connection: redisConnection,
      concurrency: (await getAdminSettings().maxConcurrentJobs) || 3,
    });

    worker.on("completed", async (job) => {
      try {
        await updateLeadsStatus(job.data?.dbLevelId, "completed");
      } catch (e) {
        logger.error("error on complete status update", {
          jobId: job?.id,
          error: e.message,
        });
      }
    });

    worker.on("failed", async (job, err) => {
      try {
        const attemptsMade = job?.attemptsMade;
        const maxAttempts = job.opts?.attempts ?? 2;
        if (attemptsMade >= maxAttempts) {
          await updateLeadsStatus(
            job.data?.dbLevelId,
            "failed",
            true,
            err.message,
          );
          logger.error("Lead job permanently failed", {
            jobId: job.id,
            error: err.message,
            attemptsMade,
          });
        } else {
          return;
        }
      } catch (e) {
        logger.error("Lead failed handler error", {
          jobId: job?.id,
          error: e.message,
        });
      }
    });
    worker.on("error", (err) => {
      logger.error("Lead worker runtime error", {
        error: err.message,
      });
    });

    const shutdown = async () => {
      logger.info("Lead worker shutting down");
      try {
        await worker.close();
        await mongoose.disconnect();
        logger.info("Lead worker shutdown complete");
        process.exit(0);
      } catch (err) {
        logger.error("Lead worker shutdown failed", {
          error: err.message,
        });
        process.exit(1);
      }
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (e) {
    logger.error("Failed to start Leads Job Worker", { error: e });
  }
}

LeadsJobWorker();

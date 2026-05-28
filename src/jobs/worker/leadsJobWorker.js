import { Worker } from "bullmq";
import mongoose from "mongoose";
import { env } from "../../config/env.js";
import logger from "../../utils/logger.js";
import {
  releaseCreditService,
  updateLeadsStatus,
} from "../../services/databaseService.js";
import { connectRedis, redisConnection } from "../../config/redisConfig.js";
import { getAdminSettings } from "../../services/redisService.js";

const MONGO_DB_URI = String(env.MONGO_URI_PRIMARY);

// Global references for safe process shutdown scoping
let workerInstance = null;

// 1. Register database event listeners ONCE globally
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
    // Prevent duplicate connections if already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_DB_URI, {
        maxPoolSize: 10, 
      });
    }
    await connectRedis();

    logger.info("Started, Leads Job Worker");
    
    // Assign to module-scoped variable for shutdown access
    workerInstance = new Worker("lead-job-queue", "../../services/LeadsWorkerProcessor.js", {
      connection: redisConnection,
      concurrency: 1,
    });

    // --- SUCCESS HANDLER ---
    workerInstance.on("completed", async (job) => {
      if (!job) return;
      try {
        await updateLeadsStatus(job.data?.dbLevelId, "completed");
      } catch (e) {
        logger.error("error on complete status update", {
          jobId: job.id,
          error: e.message,
        });
      }
    });

    // --- FAILURE HANDLER ---
    workerInstance.on("failed", async (job, err) => {
      if (!job) {
        logger.error("Job failed but job object is undefined", { error: err?.message });
        return;
      }

      try {
        const attemptsMade = job.attemptsMade ?? 0;
        const maxAttempts = job.opts?.attempts ?? 2;

        if (attemptsMade >= maxAttempts) {
          const { userId, config } = job.data || {};
          
          if (
            userId &&
            typeof config === "object" &&
            config !== null &&
            Object.keys(config).length !== 0
          ) {
            // FIX: Fetch fresh settings dynamically to avoid stale configurations
            const freshAdminSettings = await getAdminSettings();
            const tierKey = job.data?.config?.tier;
            const creditsToRelease = freshAdminSettings?.creditRules?.[tierKey] || 3;

            const releaseCredit = await releaseCreditService(userId, creditsToRelease);
            
            if (!releaseCredit?.success) {
              logger.error("Failed to release user credits", {
                error: true,
                jobId: job.id,
                reason: releaseCredit?.message
              });
            }
          }

          await updateLeadsStatus(
            job.data?.dbLevelId,
            "failed",
            true,
            err?.message || "Unknown error",
          );

          logger.error("Lead job permanently failed", {
            jobId: job.id,
            error: err?.message,
            attemptsMade,
          });
        }
      } catch (e) {
        logger.error("Lead failed handler internal error", {
          jobId: job?.id,
          error: e.message,
        });
      }
    });

    // --- RUNTIME ERROR HANDLER ---
    workerInstance.on("error", (err) => {
      logger.error("Lead worker runtime error", {
        error: err.message,
      });
    });

  } catch (e) {
    logger.error("Failed to start Leads Job Worker", { error: e.message });
  }
}

// --- SAFE CLEAN SHUTDOWN MANAGER ---
const shutdown = async (signal) => {
  logger.info(`Lead worker received ${signal}, shutting down...`);
  try {
    if (workerInstance) {
      await workerInstance.close();
      logger.info("BullMQ worker pool drained and closed.");
    }
    await mongoose.disconnect();
    logger.info("Lead worker shutdown completely clean.");
    process.exit(0);
  } catch (err) {
    logger.error("Lead worker shutdown failed during disconnect cleanup", {
      error: err.message,
    });
    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Execute Worker Bootstrapper
LeadsJobWorker();

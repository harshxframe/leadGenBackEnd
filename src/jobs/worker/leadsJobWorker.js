import { Worker } from "bullmq";
import mongoose from "mongoose";
import { env } from "../../config/env.js";
import logger from "../../utils/logger.js";
import {withTimeOut} from "../../utils/withTImeOut.js";
import { fetchBusinessLeads } from "../../services/leadGenerator.service.js";

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

const DB_TIMEOUT = 15000;

function LeadsJobWorker() {
  try {
    await mongoose.connect(DBConnectionUrl, {
      maxPoolSize: 10, // Adjust this based on your workerConcurreny
    });
    const worker = new Worker("lead-job-queue", (job) => {
      try {
        const {jobId, businessNiche, city, keywords, config, id, selectedFields, concurrency} = job.data || {};
        //Now we are ready to process request
        const generateLeads = await withTimeOut(fetchBusinessLeads({businessNiche, city, keywords, leadLimit:config.depth, concurrency:config.concurrency}), (60*30));
   if(generateLeads){




   }else{
    throw new Error("Failed to extract leads");
   }







      } catch (e) {
        throw e;
      }
    });

    worker.on("completed", async (job) => {});

    worker.on("error", async (job) => {});

    worker.on("failed", async (job) => {});
  } catch (e) {
    logger.error("Failed to start Leads Job Worker", { error: e });
  }
}

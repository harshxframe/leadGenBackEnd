import { Queue } from "bullmq";
import { configuration, redisConnection } from "../../config/redisConfig.js";

export const leadJobQueue = new Queue("lead-job-queue", {
  connection: redisConnection,
  defaultJobOptions: configuration,
});

export const apiLeadJobQueue = new Queue("api-lead-job-queue", {
  connection: redisConnection,
  defaultJobOptions: configuration,
});

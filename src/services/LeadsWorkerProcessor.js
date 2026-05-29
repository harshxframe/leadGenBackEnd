import {
  detuctCreditService,
  leadsSavingService,
  updateLeadsStatus,
} from "./databaseService.js";
import { withTimeOut } from "../utils/withTimeOut.js";
import { fetchBusinessLeads } from "./leadGenerator.service.js";
import { getItemsinLimit } from "../utils/getRequestAmountOfLead.js";
import { buildFinalLeads } from "../utils/leadsFilter.js";
import { getAdminSettings } from "./redisService.js";
import logger from "../utils/logger.js";
import { sendEmailHelperOnJobSuccess } from "../utils/leadsConmpletionAlert.js";
import { formatProcessingTime } from "../utils/formatProcessingTime.js";

export async function leadsWorkerProcessor(job) {
  try {
    let totalTimeTaken = "Unknown";
    const {
      name,
      userEmail,
      userId,
      jobId,
      dbLevelId,
      businessNiche,
      city,
      keywords,
      config,
      selectedFields,
    } = job.data || {};
    if (
      !name ||
      !userEmail ||
      !userId ||
      !jobId ||
      !dbLevelId ||
      !businessNiche ||
      !city ||
      !Array.isArray(keywords) ||
      keywords.length === 0 ||
      typeof config !== "object" ||
      config === null ||
      Array.isArray(config) ||
      Object.keys(config).length === 0 ||
      typeof selectedFields !== "object" ||
      selectedFields === null ||
      Array.isArray(selectedFields) ||
      Object.keys(selectedFields).length === 0
    ) {
      throw new Error("Invalid Job");
    }

    //Change the status queued in to processing.
    const updateStatus = await updateLeadsStatus(dbLevelId, "processing");
    if (!updateStatus.success) {
      logger.error("Failed to update processing status", {
        error: true,
        jobId: job.id,
      });
    }

    const generateLeads = await withTimeOut(
      fetchBusinessLeads({
        businessNiche,
        city,
        keywords,
        leadLimit: config.depth,
        concurrency: config.concurrency,
        extractEmails: selectedFields?.emails,
        limit: config.limit,
      }),
      3600 * 1000,
    );
    if (Array.isArray(generateLeads) && generateLeads.length !== 0) {
      const processLeads = buildFinalLeads({
        leads: generateLeads,
        selectedFields: selectedFields,
      });

      const saveInDB = await leadsSavingService(
        userId,
        dbLevelId,
        processLeads,
      );
      if (!saveInDB.success) {
        throw new Error("Failed to save leads in DB");
      }
      const updateStatus = await updateLeadsStatus(dbLevelId, "completed");
      if (!updateStatus.success) {
        logger.error("Leads saved in DB but failed to update status", {
          error: true,
          jobId: job.id,
        });
      }
      const adminSettings = await getAdminSettings();

      const getRequiredCredit = adminSettings?.creditRules?.[config.tier] || 3;
      const updateCredit = await detuctCreditService(
        userId,
        dbLevelId,
        getRequiredCredit,
        processLeads.length,
      );
      if (!updateCredit.success) {
        logger.error("Leads saved in DB but failed to detuct credit", {
          error: true,
          jobId: job.id,
        });
      }
      if (updateCredit.success) {
        const { createdAt, updatedAt } = updateCredit.data?.jobData;
        if (createdAt && updatedAt) {
          totalTimeTaken = formatProcessingTime(createdAt, updatedAt);
        }
      }

      const sendNotificationOnComplete = await sendEmailHelperOnJobSuccess(
        name,
        businessNiche,
        city,
        processLeads.length,
        getRequiredCredit,
        userEmail,
        totalTimeTaken,
        jobId,
      );
      if (!sendNotificationOnComplete) {
        logger.error("Leads saved in DB but failed to notify user", {
          error: true,
          jobId: job.id,
        });
      }
      logger.info("Lead job completed successfully", {
        jobId: job.id,
        dbLevelId,
        totalLeads: processLeads.length,
      });
      return {
        success: true,
      };
    } else {
      throw new Error("Failed to extract leads");
    }
  } catch (e) {
    throw new Error(e?.message || "Worker failed");
  }
}

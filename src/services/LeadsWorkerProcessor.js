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
    var totalTimeTaken = "Unknown";
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
      Object.keys(config || {}).length === 0 ||
      Object.keys(selectedFields || {}).length === 0
    ) {
      throw new Error("Invalid Job");
    }

    //Change the status queued in to processing.
    const updateStatus = await updateLeadsStatus(dbLevelId, "processing");
    if (!updateStatus.success) {
      throw new Error("Failed to update status");
    }

    const generateLeads = await withTimeOut(
      fetchBusinessLeads({
        businessNiche,
        city,
        keywords,
        leadLimit: config.depth,
        concurrency: config.concurrency,
        extractEmails: selectedFields?.emails,
      }),
      3600 * 1000,
    );
    if (Array.isArray(generateLeads) && generateLeads.length !== 0) {
      // Here we got leads
      // Now need to swtich status of Job and save in database
      // 1. Validate by limit and remove extra first and process leads too
      const requestedOnOfLeads = getItemsinLimit(
        generateLeads,
        config.leadLimit,
      );
      const processLeads = buildFinalLeads({
        leads: requestedOnOfLeads,
        selectedFields: selectedFields,
      });
      //Now need to save in DB and change queue status
      // For DB userId, JobDbId, Leads.
      // DB operation

      const saveInDB = await leadsSavingService(
        userId,
        dbLevelId,
        processLeads,
      );
      if (saveInDB.success) {
        const updateStatus = await updateLeadsStatus(dbLevelId, "completed");
        if (!updateStatus.success) {
          logger.error("Leads saved in DB but failed to update status", {
            error: true,
            jobId: job.id,
          });
        }
        const adminSettings = await getAdminSettings();

        const getRequiredCredit =
          adminSettings?.creditRules?.[config.tier] || 3;
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
        if(updateCredit.success){
          const {createdAt, updatedAt} = updateCredit.data?.jobData.toObject();
          if(createdAt && updatedAt){
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
          jobId
        );
        if (!sendNotificationOnComplete) {
          logger.error("Leads saved in DB but failed to notify user", {
            error: true,
            jobId: job.id,
          });
        }

        return {
          success: true,
        };
      }
      throw new Error("Failed to save leads in DB");
    } else {
      throw new Error("Failed to extract leads");
    }
  } catch (e) {
    throw e;
  }
}

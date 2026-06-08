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
import axios from "axios";

export async function apiLeadsWorkerProcessor(job) {
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
      webHookUrl,
    } = job.data || {};
    if (
      !name ||
      !userEmail ||
      !userId ||
      !jobId ||
      !dbLevelId ||
      !businessNiche ||
      !city ||
      !webHookUrl ||
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
      18000000,
    );
    if (Array.isArray(generateLeads) && generateLeads.length !== 0) {
      const processLeads = buildFinalLeads({
        leads: generateLeads,
        selectedFields,
      });

      const adminSettings = await getAdminSettings();

      const requiredCredit = adminSettings?.creditRules?.[config.tier] || 3;

      const postData = {
        totalLeadsFound: processLeads.length,
        leads: processLeads,
        creditUsed: requiredCredit,
        jobId:jobId,
        message: "Leads extraction successfully",
        greeting: "Thank you for choosing us, Happy Coding",
      };

      try {
        await axios.post(webHookUrl, postData);

        const updateCredit = await detuctCreditService(
          userId,
          dbLevelId,
          requiredCredit,
          processLeads.length,
        );

        if (!updateCredit.success) {
          throw new Error("Credit deduction failed");
        }

        const updateStatus = await updateLeadsStatus(dbLevelId, "completed");

        if (!updateStatus.success) {
          throw new Error("Status update failed");
        }

        return {
          success: true,
        };
      } catch (error) {
        logger.error("Lead processing failed", error);

        throw error;
      }
    } else {
      throw new Error("Failed to extract leads");
    }
  } catch (e) {
    throw new Error(e?.message || "Worker failed");
  }
}

import { updateLeadsStatus } from "./databaseService";
import { withTimeOut } from "../utils/withTimeOut.js";

export async function leadsWorkerProcessor(job) {
  try {
    const {
      jobId,
      dbLevelId,
      businessNiche,
      city,
      keywords,
      config,
      id,
      selectedFields,
      concurrency,
    } = job.data || {};
    if (
      !jobId ||
      !dbLevelId ||
      !businessNiche ||
      !city ||
      keywords.length === 0 ||
      Object.keys(config || {}).length === 0 ||
      !id ||
      Object.keys(selectedFields).length === 0 ||
      !concurrency
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
      }),
      60 * 60,
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




    } else {
      throw new Error("Failed to extract leads");
    }
  } catch (e) {
    throw e;
  }
}

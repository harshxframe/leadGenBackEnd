import { getScraperConfig } from "../utils/getDepthFromLimit.js";
import { responseBody } from "../utils/responseBody.js";
import { readToken } from "../utils/jwt.js";
import { generateJobKey } from "../utils/jobIdGenerator.js";
import {
  createLeadJobService,
  getAPIUserService,
  getJobsStatusByIdsService,
  getUserService,
  reserveJobCreditService,
} from "../services/databaseService.js";
import { getAdminSettings } from "../services/redisService.js";
import { apiLeadJobQueue, leadJobQueue } from "../jobs/queue/queue.js";

export const placeJobRequest = async (req, res) => {
  try {
    let { token, businessNiche, city, keywords, leadLimit, selectedFields } =
      req.body || {};

    if (
      !token ||
      !businessNiche ||
      !city ||
      !Array.isArray(keywords) ||
      keywords.length <= 0 ||
      leadLimit <= 0 ||
      Object.keys(selectedFields || {})?.length === 0
    ) {
      return res
        .status(400)
        .send(responseBody(true, false, 400, "Payload not satisfied", {}));
    }

    const getId = readToken(token);
    if (!getId) {
      return res
        .status(403)
        .send(responseBody(true, false, 403, "Invalid token", {}));
    }

    const uniqueJobId = generateJobKey();

    const isUserExsit = await getUserService(getId?.id);
    if (!isUserExsit.success) {
      return res
        .status(400)
        .send(
          responseBody(
            true,
            false,
            400,
            isUserExsit.message || "User does not exsit",
            {},
          ),
        );
    }

    const user = isUserExsit.data?.user.toObject();
    if (user.isBlocked) {
      return res.status(400).send(
        responseBody(true, false, 400, "User is blocked", {
          events: { NO_CREDITS: "ACCOUNT_IS_BLOCKED" },
        }),
      );
    }

    const scrapConfig = getScraperConfig(leadLimit);
    keywords = keywords.slice(0, scrapConfig.maxKeyowrds);
    const payload = {
      userId: getId?.id,
      jobId: uniqueJobId,
      requestSource: "dashboard",
      businessNiche: businessNiche,
      city: city,
      keywords: keywords,
      leadLimit: leadLimit,
      selectedFields: selectedFields,
    };
    const { creditRules } = (await getAdminSettings()) || {};
    if (Object.keys(creditRules || {}).length === 0) {
      throw new Error("System Error");
    }
    const requestCost = creditRules[scrapConfig.tier] || 5;

    // check the credit along with locked credit
    if (Number(user.credits) < Number(requestCost)) {
      return res
        .status(400)
        .send(
          responseBody(
            true,
            false,
            400,
            "User don't have enough credits to perform this jobs",
            { events: { NO_CREDITS: "NO_ENOUGH_CREDITS" } },
          ),
        );
    }

    const reserveCredits = await reserveJobCreditService(
      getId?.id,
      requestCost,
    );
    if (!reserveCredits.success) {
      return res
        .status(400)
        .send(
          responseBody(
            true,
            false,
            400,
            isDBJobCreated.message || "Failed to detuct credit",
            {},
          ),
        );
    }

    // Now it's time to create JOB in DB then Push In Queue.
    const isDBJobCreated = await createLeadJobService(payload);
    if (!isDBJobCreated.success) {
      return res
        .status(400)
        .send(
          responseBody(
            true,
            false,
            400,
            isDBJobCreated.message || "Failed to create Job",
            {},
          ),
        );
    }
    const dbJobId = isDBJobCreated.data.job?.jobId;
    const dbLevelId = isDBJobCreated.data.job?._id;

    const queueDataPayload = {
      name: user?.name,
      userEmail: user?.email,
      userId: getId?.id,
      dbLevelId: dbLevelId,
      jobId: dbJobId,
      businessNiche: businessNiche,
      city: city,
      keywords: keywords,
      config: scrapConfig,
      selectedFields: selectedFields,
    };
    const leadJob = await leadJobQueue.add("lead-job-queue", queueDataPayload);
    if (leadJob?.id) {
      return res.send(
        responseBody(false, true, 200, "Request placed successfull", {
          jobId: dbJobId,
        }),
      );
    }
    return res
      .status(400)
      .send(responseBody(true, false, 400, "Failed to place request", {}));
  } catch (e) {
    return res
      .status(500)
      .send(responseBody(true, false, 500, e.message || "Server Error", {}));
  }
};

export const placeAPIRequest = async (req, res) => {
  try {
    const apiKey = req.body?.bearerToken;

    let { businessNiche, city, keywords, leadLimit, selectedFields } =
      req.body || {};

    if (
      !businessNiche ||
      !city ||
      !Array.isArray(keywords) ||
      keywords.length <= 0 ||
      leadLimit <= 0 ||
      Object.keys(selectedFields || {})?.length === 0
    ) {
      return res
        .status(400)
        .send(responseBody(true, false, 400, "Payload not satisfied", {}));
    }

    const uniqueJobId = generateJobKey();

    const isAPIValid = await getAPIUserService(apiKey);
    if (!isAPIValid.success) {
      return res
        .status(401)
        .send(
          responseBody(
            true,
            false,
            401,
            isAPIValid.message || "API is not valid",
            {},
          ),
        );
    }

    const user = isAPIValid.data?.user.toObject();
    if (user.isBlocked) {
      return res.status(400).send(
        responseBody(true, false, 400, "Account is blocked", {
          events: { EVENT: "ACCOUNT_IS_BLOCKED" },
        }),
      );
    }

    const scrapConfig = getScraperConfig(leadLimit);
    keywords = keywords.slice(0, scrapConfig.maxKeyowrds);
    const payload = {
      userId: user?._id,
      jobId: uniqueJobId,
      requestSource: "api",
      businessNiche: businessNiche,
      city: city,
      keywords: keywords,
      leadLimit: leadLimit,
      selectedFields: selectedFields,
    };
    const { creditRules } = (await getAdminSettings()) || {};
    if (Object.keys(creditRules || {}).length === 0) {
      throw new Error("System Error");
    }
    const requestCost = creditRules[scrapConfig.tier] || 5;

    // check the credit along with locked credit
    if (Number(user.credits) < Number(requestCost)) {
      return res
        .status(400)
        .send(
          responseBody(
            true,
            false,
            400,
            "User don't have enough credits to perform this jobs",
            { events: { EVENT: "NO_ENOUGH_CREDITS" } },
          ),
        );
    }

    const reserveCredits = await reserveJobCreditService(
      user?._id,
      requestCost,
    );
    if (!reserveCredits.success) {
      return res
        .status(400)
        .send(
          responseBody(
            true,
            false,
            400,
            isDBJobCreated.message || "Failed to detuct credit",
            {},
          ),
        );
    }

    // Now it's time to create JOB in DB then Push In Queue.
    const isDBJobCreated = await createLeadJobService(payload);
    if (!isDBJobCreated.success) {
      return res
        .status(400)
        .send(
          responseBody(
            true,
            false,
            400,
            isDBJobCreated.message || "Failed to create Job",
            {},
          ),
        );
    }

    const dbJobId = isDBJobCreated.data.job?.jobId;
    const dbLevelId = isDBJobCreated.data.job?._id;

    const queueDataPayload = {
      name: user?.name,
      userEmail: user?.email,
      userId: user?._id,
      dbLevelId: dbLevelId,
      jobId: dbJobId,
      businessNiche: businessNiche,
      city: city,
      keywords: keywords,
      config: scrapConfig,
      selectedFields: selectedFields,
      webHookUrl: user?.webHookUrl,
    };

    const leadJob = await apiLeadJobQueue.add(
      "api-lead-job-queue",
      queueDataPayload,
    );
    if (leadJob?.id) {
      return res.send(
        responseBody(false, true, 200, "Request placed successfull", {
          jobId: dbJobId,
        }),
      );
    }
    return res
      .status(400)
      .send(responseBody(true, false, 400, "Failed to place request", {}));
  } catch (e) {
    return res
      .status(500)
      .send(responseBody(true, false, 500, e.message || "Server Error", {}));
  }
};

export const getJobsStatus = async (req, res) => {
  try {
    const apiKey = req.body?.bearerToken;
    const { jobIds } = req.body || {};

    if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
      return res
        .status(400)
        .send(responseBody(true, false, 400, "Payload not satisfied", {}));
    }

    const isSuccess = await getJobsStatusByIdsService(jobIds);

    if (isSuccess.success) {
      const jobsStatus = isSuccess?.data?.jobsStatus;
      return res.status(200).send(
        responseBody(false, true, 200, isSuccess.message, {
          jobsStatus,
        }),
      );
    }
    return res
      .status(400)
      .send(responseBody(true, false, 400, isSuccess.message, {}));
  } catch (e) {
    return res
      .status(500)
      .send(responseBody(true, false, 500, e.message || "Server Error", {}));
  }
};

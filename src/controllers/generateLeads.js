import { fetchBusinessLeads } from "../services/leadGenerator.service.js";
import { getScraperConfig } from "../utils/getDepthFromLimit.js";
import { responseBody } from "../utils/responseBody.js";
import { readToken } from "../utils/jwt.js";
import { generateJobKey } from "../utils/jobIdGenerator.js";
import {
  createLeadJobService,
  getUserService,
} from "../services/databaseService.js";
import { getAdminSettings } from "../services/redisService.js";
import { leadJobQueue } from "../jobs/queue.js";

export const generateLeads = async (req, res) => {
  try {
    // Business niche
    //City
    //Optional keywords
    const { businessNiche, city, keywords } = req.body || {};
    const businessNicheR = String(businessNiche);
    const cityR = String(city);

    if (!businessNiche || !cityR) {
      return res
        .status(400)
        .send(responseBody(true, false, 400, "Payload not satisfied", {}));
    }

    if (!Array.isArray(keywords) || keywords.length < 1) {
      return res
        .status(400)
        .send(responseBody(true, false, 400, "Payload not satisfied", {}));
    }

    const leadLimit = getDepthFromLimit(1);
    //const leads = await fetchBusinessLeads({ businessNiche, city, keywords });
    const leads = await fetchBusinessLeads({
      businessNiche,
      city,
      keywords,
      leadLimit,
    });

    return res.send(
      responseBody(false, true, 200, "Leads generated", { leads: leads }),
    );
  } catch (e) {
    return res
      .status(500)
      .send(responseBody(true, false, 500, e.message || "Server Error", {}));
  }
};

export const placeJobRequest = async (req, res) => {
  try {
    const { token, businessNiche, city, keywords, leadLimit, selectedFields } =
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

    const isUserExsit = await getUserService(getId?.id);
    if (!isUserExsit.success) {
      return res
        .status(400)
        .send(
          responseBody(
            true,
            false,
            400,
            isSuccess.message || "User does not exsit",
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
    const { creditRules } = (await getAdminSettings()) || {};
    if (Object.keys(creditRules || {}).length === 0) {
      throw new Error("System Error");
    }

    const requestCost = creditRules[scrapConfig.tier] || 5;

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
    const queueDataPayload = {
      jobId: dbJobId,
      businessNiche: businessNiche,
      city: city,
      keywords: keywords,
      config: scrapConfig,
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
    //return res.send({ scrapConfig, requestCost, isDBJobCreated });
  } catch (e) {
    return res
      .status(500)
      .send(responseBody(true, false, 500, e.message || "Server Error", {}));
  }
};

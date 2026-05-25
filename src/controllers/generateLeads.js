import { fetchBusinessLeads } from "../services/leadGenerator.service.js";
import { getScraperConfig } from "../utils/getDepthFromLimit.js";
import { responseBody } from "../utils/responseBody.js";
import { readToken } from "../utils/jwt.js";
import { generateJobKey } from "../utils/jobIdGenerator.js";
import {
  createLeadJobService,
  getUserService,
  reserveJobCreditService,
} from "../services/databaseService.js";
import { getAdminSettings } from "../services/redisService.js";
import { leadJobQueue } from "../jobs/queue/queue.js";
import { buildFinalLeads } from "../utils/leadsFilter.js";

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

    const leadConfig = getScraperConfig(20);
    //const leads = await fetchBusinessLeads({ businessNiche, city, keywords });
    const leads = await fetchBusinessLeads({
      businessNiche,
      city,
      keywords,
      leadLimit: leadConfig.depth,
      concurrency: leadConfig.concurrency,
      extractEmails: false,
    });

    const finalLeads = await buildFinalLeads({
      leads: leads,
      selectedFields: {
        basicInfo: true,
        contactInfo: true,
        locationData: true,
        emails: true,
        reviews: true,
        reviewAnalytics: true,
        images: true,
        ownerInfo: true,
        socialLinks: true,
        bookingPlatforms: true,
        seoData: true,
        techStack: true,
        adsRunning: true,
        whatsappNumber: true,
        aiInsights: true,
        aiOutreach: true,
        leadScoring: true,
      },
    });
    console.log(JSON.stringify(finalLeads));
    return res.send(
      responseBody(false, true, 200, "Leads generated", { leads: finalLeads }),
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
      dbLevelId:dbLevelId,
      jobId: dbJobId,
      businessNiche: businessNiche,
      city: city,
      keywords: keywords,
      config: scrapConfig,
      selectedFields: selectedFields,
    };
console.log(JSON.stringify(queueDataPayload));
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

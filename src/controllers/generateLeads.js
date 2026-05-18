import { fetchBusinessLeads } from "../services/leadGenerator.service.js";
import { getDepthFromLimit } from "../utils/getDepthFromLimit.js";
import { responseBody } from "../utils/responseBody.js";

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

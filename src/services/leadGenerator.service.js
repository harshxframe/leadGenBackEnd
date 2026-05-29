import { runGoogleMapsScraper } from "./googleMapsScraper.service.js";
import { buildSearchQueries } from "../utils/buildSearchQuery.js";
import { parseJsonItems } from "../utils/jsonItemsParser.js";
import { enrichLeadsWithEmails } from "../utils/processToEnrichEmail.js";
import { getItemsinLimit, prioritizeLeadsByEmail } from "../utils/getRequestAmountOfLead.js";

export const fetchBusinessLeads = async ({
  businessNiche,
  city,
  keywords,
  leadLimit,
  concurrency,
  extractEmails,
  limit
}) => {
  try {
    const searchQuery = buildSearchQueries({
      businessNiche,
      city,
      keywords,
    });

    // Lead Scraping Step
    const leads = await runGoogleMapsScraper({
      queries: searchQuery,
      depth: leadLimit,
      concurrency,
      extractEmails,
    });
    // No leads found
    if (!Array.isArray(leads) || leads.length === 0) {
      return [];
    }
    // Email Enrichment Step
    if (extractEmails) {
      const enrichLeads = await enrichLeadsWithEmails(leads);
      return prioritizeLeadsByEmail(enrichLeads, limit);
    }
    return getItemsinLimit(leads, limit);
  } catch (e) {
    throw new Error(e.message || "Failed to generate leads");
  }
};

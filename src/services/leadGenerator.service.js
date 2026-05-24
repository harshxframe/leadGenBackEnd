import { runGoogleMapsScraper } from "./googleMapsScraper.service.js";
import { buildSearchQueries } from "../utils/buildSearchQuery.js";
import { parseJsonItems } from "../utils/jsonItemsParser.js";

export const fetchBusinessLeads = async ({
  businessNiche,
  city,
  keywords,
  leadLimit,
  concurrency,
  extractEmails
}) => {
  try {
    const searchQuery = buildSearchQueries({
      businessNiche,
      city,
      keywords,
    });

    console.log(searchQuery);

    const leads = await runGoogleMapsScraper({
      queries: searchQuery,
      depth: leadLimit,
      concurrency: concurrency,
      extractEmails: extractEmails,
    });
    return leads;
  } catch (e) {
    throw new Error(e.message || "Failed to generate leads");
  }
};

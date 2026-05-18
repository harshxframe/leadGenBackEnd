import { runGoogleMapsScraper } from "./googleMapsScraper.service.js";
import { buildSearchQuery } from "../utils/buildSearchQuery.js";
import { parseJsonItems } from "../utils/jsonItemsParser.js";

export const fetchBusinessLeads = async ({
  businessNiche,
  city,
  keywords,
  leadLimit,
}) => {
  try {
    const searchQuery = buildSearchQuery({
      businessNiche,
      city,
      keywords,
    });

    console.log(searchQuery);

    const leads = await runGoogleMapsScraper(searchQuery, leadLimit);
    return leads;
  } catch (e) {
    throw new Error(e.message || "Failed to generate leads");
  }
};

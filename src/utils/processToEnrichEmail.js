import { enrichWebsiteEmails } from "../services/emailEnrichment.js";

export async function enrichLeadsWithEmails(leads = []) {
  if (!Array.isArray(leads) || leads.length === 0) {
    return [];
  }

  try {
    const websites = leads
      .filter(
        (lead) =>
          lead?.place_id &&
          lead?.web_site &&
          typeof lead.web_site === "string" &&
          lead.web_site.trim() !== "",
      )
      .map((lead) => ({
        placeId: lead.place_id,
        website: lead.web_site,
      }));

    if (websites.length === 0) {
      return leads.map((lead) => ({
        ...lead,
        emails: [],
      }));
    }

    const enrichmentResults = await enrichWebsiteEmails(websites);
    const emailMap = new Map();

    for (const item of enrichmentResults || []) {
      emailMap.set(item.placeId, [
        ...new Set(
          (item.emails || [])
            .map((emailObj) => emailObj?.email)
            .filter(Boolean),
        ),
      ]);
    }

    return leads.map((lead) => ({
      ...lead,
      emails: emailMap.get(lead.place_id) || [],
    }));
  } catch (error) {
    console.error("Email enrichment failed:", error);

    return leads.map((lead) => ({
      ...lead,
      emails: [],
    }));
  }
}

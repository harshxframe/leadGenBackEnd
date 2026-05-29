export function getItemsinLimit(arr, limit = 50) {
  return arr.slice(0, limit);
}

export function prioritizeLeadsByEmail(
  leads = [],
  limit = 0,
) {
  if (!Array.isArray(leads) || leads.length === 0) {
    return [];
  }

  const leadsWithEmails = leads.filter(
    (lead) =>
      Array.isArray(lead?.emails) &&
      lead.emails.length > 0,
  );

  const leadsWithoutEmails = leads.filter(
    (lead) =>
      !Array.isArray(lead?.emails) ||
      lead.emails.length === 0,
  );

  return [
    ...leadsWithEmails,
    ...leadsWithoutEmails,
  ].slice(0, limit);
}
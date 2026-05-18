export const buildSearchQuery = ({
  businessNiche,
  city,
  keywords,
}) => {
  const optionalKeywords = keywords.join(" ");

  return `${businessNiche} ${optionalKeywords} in ${city}`;
};
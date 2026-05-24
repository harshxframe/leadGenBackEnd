export const buildSearchQueries = ({
  businessNiche,
  city,
  keywords,
}) => {
  return keywords.map((keyword) => {
    return `${businessNiche} ${keyword} in ${city}`;
  });
};
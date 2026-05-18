export const getDepthFromLimit = (limit) => {
  if (limit <= 20) return 1;
  if (limit <= 50) return 2;
  if (limit <= 100) return 5;

  return 10;
};
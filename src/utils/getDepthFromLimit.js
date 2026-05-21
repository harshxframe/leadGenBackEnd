/**
 * Maps user requested limit to scraper configuration.
 * Includes a ~20% buffer to account for duplicates/inconsistent search yields.
 */
export const getScraperConfig = (limit) => {
  const target = limit * 1.2; // Add 20% buffer

  const config = {
    depth: 1,
    tier: "small",
    concurrency: 1
  };

  if (target <= 60) { // 50 * 1.2
    config.depth = 1;
    config.tier = "small";
    config.concurrency = 1;
  } else if (target <= 120) { // 100 * 1.2
    config.depth = 3;
    config.tier = "medium";
    config.concurrency = 2;
  } else if (target <= 300) { // 250 * 1.2
    config.depth = 5;
    config.tier = "large";
    config.concurrency = 4; // Bumped up for efficiency
  } else {
    config.depth = 10; // Increased to ensure 500+ coverage
    config.tier = "huge";
    config.concurrency = 6; // Optimized for performance
  }

  return config;
};
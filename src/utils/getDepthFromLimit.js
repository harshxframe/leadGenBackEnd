/**
 * Maps user requested limit to scraper configuration.
 * Includes a ~20% buffer to account for duplicates/inconsistent search yields.
 */
// export const getScraperConfig = (limit) => {
//   const target = limit * 1.2; // Add 20% buffer

//   const config = {
//     // Keyowrds 1 - 3
//     depth: 1,
//     tier: "small",
//     concurrency: 2,
//     limit: limit,
//     maxKeyowrds: 3,
//   };

//   if (target <= 60) {
//     // 50 * 1.2
//     config.depth = 1; // Keyowrds 1 - 3
//     config.tier = "small";
//     config.concurrency = 2;
//     config.limit = limit;
//     config.maxKeyowrds = 3;
//   } else if (target <= 120) {
//     // 100 * 1.2
//     config.depth = 2; // Keyowrds 3 - 6
//     config.tier = "medium";
//     config.concurrency = 4;
//     config.limit = limit;
//     config.maxKeyowrds = 6;
//   } else if (target <= 300) {
//     // 250 * 1.2
//     config.depth = 3; // Keyowrds 6 - 10
//     config.tier = "large";
//     config.concurrency = 5; // Bumped up for efficiency
//     config.limit = limit;
//     config.maxKeyowrds = 10;
//   } else {
//     config.depth = 4; // Increased to ensure 500+ coverage // Keyowrds 10 - 15
//     config.tier = "huge";
//     config.concurrency = 5; // Optimized for performance
//     config.limit = limit;
//     config.maxKeyowrds = 15;
//   }

//   return config;
// };


/**
 * Maps user requested limit to scraper configuration.
 * Supports: 20, 50, 100 leads
 */
export const getScraperConfig = (limit) => {
  const config = {
    depth: 1,
    tier: "small",
    concurrency: 2,
    limit,
    maxKeyowrds: 3,
  };

  if (limit <= 20) {
    // 20 Leads
    config.depth = 1;
    config.tier = "small";
    config.concurrency = 1;
    config.maxKeyowrds = 2;
  } else if (limit <= 50) {
    // 50 Leads
    config.depth = 1;
    config.tier = "medium";
    config.concurrency = 2;
    config.maxKeyowrds = 3;
  } else if (limit <= 100) {
    // 100 Leads
    config.depth = 2;
    config.tier = "large";
    config.concurrency = 4;
    config.maxKeyowrds = 6;
  }

  return config;
};

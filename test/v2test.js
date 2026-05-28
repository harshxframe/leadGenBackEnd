// npm i axios cheerio p-limit

import axios from "axios";
import * as cheerio from "cheerio";
import pLimit from "p-limit";

/**
 * ============================================
 * FAST EMAIL ENRICHMENT ENGINE
 * ============================================
 *
 * FEATURES:
 * - ultra fast HTML scraping
 * - NO playwright
 * - NO chromium
 * - concurrency controlled
 * - contact/about page discovery
 * - email deduplication
 * - fake email filtering
 * - domain matching
 * - confidence scoring
 * - retry support
 * - processing time metrics
 * - scalable architecture
 *
 * INPUT:
 * [
 *   {
 *     placeId,
 *     website
 *   }
 * ]
 *
 * OUTPUT:
 * [
 *   {
 *     placeId,
 *     website,
 *     emails: [
 *       {
 *         email,
 *         confidence
 *       }
 *     ],
 *     scannedPages: [],
 *     processingTime,
 *     success
 *   }
 * ]
 */

/**
 * ============================================
 * CONFIG
 * ============================================
 */

const REQUEST_TIMEOUT = 8000;

const MAX_CONCURRENCY = 3;

const MAX_CONTACT_PAGES = 5;

const RETRY_DELAY = 1000;

/**
 * ============================================
 * CONTACT PAGE KEYWORDS
 * ============================================
 */

const CONTACT_PAGE_KEYWORDS = [
  "contact",
  "contact-us",
  "about",
  "about-us",
  "support",
  "team",
  "help",
  "reach-us",
  "connect",
  "customer-support",
];

/**
 * ============================================
 * HIGH CONFIDENCE PREFIXES
 * ============================================
 */

const HIGH_CONFIDENCE_PREFIXES = [
  "info",
  "contact",
  "support",
  "sales",
  "booking",
  "reservations",
  "reservation",
  "help",
  "hello",
  "admin",
  "care",
  "customersupport",
];

/**
 * ============================================
 * EMAIL REGEX
 * ============================================
 */

const EMAIL_REGEX =
  /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}\b/gi;

/**
 * ============================================
 * INVALID EMAIL KEYWORDS
 * ============================================
 */

const INVALID_EMAIL_KEYWORDS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".svg",
  ".gif",
  ".mp4",
  ".mp3",
  ".webm",
  ".css",
  ".js",
  "@2x",
  "example.com",
  "example.org",
  "wixpress",
  "sentry",
  "cloudflare",
  "bootstrap",
  "jquery",
  "fontawesome",
  "googleusercontent",
  "schema.org",
  "noreply",
  "no-reply",
  "donotreply",
  "do-not-reply",
];

/**
 * ============================================
 * VALID TLDS
 * ============================================
 */

const VALID_TLDS = [
  "com",
  "in",
  "org",
  "net",
  "co",
  "io",
  "ai",
  "biz",
  "edu",
  "gov",
  "uk",
  "us",
  "ca",
  "au",
];

/**
 * ============================================
 * DELAY
 * ============================================
 */

const delay = (ms) =>
  new Promise((resolve) =>
    setTimeout(resolve, ms),
  );

/**
 * ============================================
 * NORMALIZE WEBSITE
 * ============================================
 */

const normalizeWebsite = (
  website,
) => {
  try {
    if (!website) return null;

    let normalized =
      website.trim();

    if (
      !normalized.startsWith(
        "http://",
      ) &&
      !normalized.startsWith(
        "https://",
      )
    ) {
      normalized = `https://${normalized}`;
    }

    return normalized;
  } catch {
    return null;
  }
};

/**
 * ============================================
 * FETCH HTML WITH RETRY
 * ============================================
 */

const fetchHTML = async (
  url,
  retry = true,
) => {
  try {
    const response =
      await axios.get(url, {
        timeout: REQUEST_TIMEOUT,

        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },

        maxRedirects: 5,

        validateStatus: (status) =>
          status >= 200 &&
          status < 400,
      });

    return response.data;
  } catch (e) {
    /**
     * RETRY ONCE
     */
    if (retry) {
      await delay(RETRY_DELAY);

      return fetchHTML(
        url,
        false,
      );
    }

    return null;
  }
};

/**
 * ============================================
 * EMAIL CONFIDENCE
 * ============================================
 */

const getEmailConfidence = (
  email,
) => {
  try {
    const localPart =
      email
        .split("@")[0]
        .toLowerCase();

    const isHighConfidence =
      HIGH_CONFIDENCE_PREFIXES.some(
        (prefix) =>
          localPart.includes(
            prefix,
          ),
      );

    return isHighConfidence
      ? "high"
      : "medium";
  } catch {
    return "low";
  }
};

/**
 * ============================================
 * EMAIL VALIDATOR
 * ============================================
 */

const isValidEmail = (
  email,
) => {
  try {
    if (!email) return false;

    const normalized =
      email
        .trim()
        .toLowerCase();

    /**
     * INVALID KEYWORDS
     */
    const hasInvalidKeyword =
      INVALID_EMAIL_KEYWORDS.some(
        (keyword) =>
          normalized.includes(
            keyword,
          ),
      );

    if (hasInvalidKeyword) {
      return false;
    }

    /**
     * VALID TLD
     */
    const tld =
      normalized
        .split(".")
        .pop();

    if (
      !VALID_TLDS.includes(tld)
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

/**
 * ============================================
 * EXTRACT EMAILS FROM HTML
 * ============================================
 */

const extractEmailsFromHTML =
  (html) => {
    try {
      if (!html) return [];

      const foundEmails =
        html.match(
          EMAIL_REGEX,
        ) || [];

      return [
        ...new Set(
          foundEmails
            .map((email) =>
              email
                .trim()
                .toLowerCase(),
            )
            .filter(
              isValidEmail,
            ),
        ),
      ];
    } catch {
      return [];
    }
  };

/**
 * ============================================
 * DISCOVER CONTACT PAGES
 * ============================================
 */

const discoverContactPages = (
  html,
  baseWebsite,
) => {
  try {
    const $ = cheerio.load(html);

    const links = [];

    $("a").each((_, el) => {
      const href =
        $(el).attr("href");

      if (!href) return;

      /**
       * SKIP MAILTO
       */
      if (
        href.startsWith(
          "mailto:",
        )
      ) {
        return;
      }

      const lowerHref =
        href.toLowerCase();

      const matched =
        CONTACT_PAGE_KEYWORDS.some(
          (keyword) =>
            lowerHref.includes(
              keyword,
            ),
        );

      if (!matched) return;

      try {
        const absoluteUrl =
          new URL(
            href,
            baseWebsite,
          ).href;

        links.push(absoluteUrl);
      } catch {}
    });

    return [
      ...new Set(links),
    ].slice(
      0,
      MAX_CONTACT_PAGES,
    );
  } catch {
    return [];
  }
};

/**
 * ============================================
 * FILTER DOMAIN EMAILS
 * ============================================
 */

const filterDomainEmails = (
  emails,
  website,
) => {
  try {
    const websiteDomain =
      new URL(
        website,
      ).hostname
        .replace("www.", "")
        .toLowerCase();

    return emails.filter(
      (email) => {
        try {
          const emailDomain =
            email
              .split("@")[1]
              ?.toLowerCase();

          if (!emailDomain)
            return false;

          return (
            emailDomain.includes(
              websiteDomain,
            ) ||
            websiteDomain.includes(
              emailDomain,
            )
          );
        } catch {
          return false;
        }
      },
    );
  } catch {
    return emails;
  }
};

/**
 * ============================================
 * PROCESS SINGLE WEBSITE
 * ============================================
 */

const processWebsite =
  async ({
    placeId,
    website,
  }) => {
    const startedAt =
      Date.now();

    try {
      const normalizedWebsite =
        normalizeWebsite(
          website,
        );

      if (!normalizedWebsite) {
        return {
          placeId,
          website,
          emails: [],
          scannedPages: [],
          processingTime: 0,
          success: false,
        };
      }

      /**
       * FETCH HOMEPAGE
       */
      const homepageHTML =
        await fetchHTML(
          normalizedWebsite,
        );

      if (!homepageHTML) {
        return {
          placeId,
          website:
            normalizedWebsite,
          emails: [],
          scannedPages: [],
          processingTime:
            Date.now() -
            startedAt,
          success: false,
        };
      }

      /**
       * HOMEPAGE EMAILS
       */
      const homepageEmails =
        extractEmailsFromHTML(
          homepageHTML,
        );

      /**
       * CONTACT PAGE DISCOVERY
       */
      const contactPages =
        discoverContactPages(
          homepageHTML,
          normalizedWebsite,
        );

      /**
       * FETCH CONTACT PAGES
       */
      const contactPageResults =
        await Promise.all(
          contactPages.map(
            async (url) => {
              const html =
                await fetchHTML(
                  url,
                );

              return {
                url,
                emails:
                  extractEmailsFromHTML(
                    html,
                  ),
              };
            },
          ),
        );

      /**
       * COMBINE EMAILS
       */
      const allEmails = [
        ...homepageEmails,

        ...contactPageResults.flatMap(
          (item) =>
            item.emails,
        ),
      ];

      /**
       * DOMAIN FILTER
       */
      const filteredEmails =
        filterDomainEmails(
          [
            ...new Set(
              allEmails,
            ),
          ],
          normalizedWebsite,
        );

      /**
       * STRUCTURED EMAILS
       */
      const structuredEmails =
        filteredEmails.map(
          (email) => ({
            email,

            confidence:
              getEmailConfidence(
                email,
              ),
          }),
        );

      return {
        placeId,

        website:
          normalizedWebsite,

        emails:
          structuredEmails,

        scannedPages: [
          normalizedWebsite,
          ...contactPages,
        ],

        processingTime:
          Date.now() -
          startedAt,

        success: true,
      };
    } catch {
      return {
        placeId,
        website,

        emails: [],

        scannedPages: [],

        processingTime:
          Date.now() -
          startedAt,

        success: false,
      };
    }
  };

/**
 * ============================================
 * MAIN EXPORTABLE SERVICE
 * ============================================
 */

export const enrichWebsiteEmails =
  async (
    websites = [],
  ) => {
    try {
      if (
        !Array.isArray(
          websites,
        )
      ) {
        return [];
      }

      /**
       * VALID INPUTS
       */
      const validWebsites =
        websites.filter(
          (item) =>
            item &&
            item.placeId &&
            item.website,
        );

      /**
       * LIMITER
       */
      const limit = pLimit(
        MAX_CONCURRENCY,
      );

      /**
       * PROCESS ALL
       */
      const results =
        await Promise.all(
          validWebsites.map(
            (item) =>
              limit(() =>
                processWebsite(
                  item,
                ),
              ),
          ),
        );

      return results;
    } catch {
      return [];
    }
  };


async function namex() {
    const result = await enrichWebsiteEmails( [{
    placeId: "plc_1001",
    website: "https://www.carwale.com/",
  },

  {
    placeId: "plc_1002",
    website: "https://www.zomato.com/",
  },

  {
    placeId: "plc_1003",
    website: "https://www.hostinger.com/",
  },

  {
    placeId: "plc_1004",
    website: "https://www.airbnb.com/",
  },

  {
    placeId: "plc_1005",
    website: "https://www.trivago.com/",
  },

  {
    placeId: "plc_1006",
    website: "https://www.booking.com/",
  },

  {
    placeId: "plc_1007",
    website: "https://www.makemytrip.com/",
  },

  {
    placeId: "plc_1008",
    website: "https://www.oyorooms.com/",
  },

  {
    placeId: "plc_1009",
    website: "https://www.marriott.com/",
  },

  {
    placeId: "plc_1010",
    website: "https://www.tajhotels.com/",
  },

  {
    placeId: "plc_1011",
    website: "https://www.hyatt.com/",
  },

  {
    placeId: "plc_1012",
    website: "https://www.radissonhotels.com/",
  },

  {
    placeId: "plc_1013",
    website: "https://www.itchotels.com/",
  },

  {
    placeId: "plc_1014",
    website: "https://www.lemonade.com/",
  },

  {
    placeId: "plc_1015",
    website: "https://www.zoho.com/",
  },

  {
    placeId: "plc_1016",
    website: "https://www.hubspot.com/",
  },

  {
    placeId: "plc_1017",
    website: "https://stripe.com/",
  },

  {
    placeId: "plc_1018",
    website: "https://slack.com/",
  },

  {
    placeId: "plc_1019",
    website: "https://openai.com/",
  },

  {
    placeId: "plc_1020",
    website: "https://www.notion.so/",
  },
]);
    console.log(JSON.stringify(result));
}

namex();



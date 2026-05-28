// npm i axios cheerio p-limit

import axios from "axios";
import * as cheerio from "cheerio";
import pLimit from "p-limit";

/**
 * FAST EMAIL ENRICHMENT ENGINE
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
 *     emails: [],
 *     scannedPages: [],
 *     success: true
 *   }
 * ]
 */

/**
 * CONFIG
 */
const REQUEST_TIMEOUT = 8000;

const MAX_CONCURRENCY = 5;

const CONTACT_PAGE_KEYWORDS = [
  "contact",
  "contact-us",
  "about",
  "about-us",
  "support",
  "team",
];

/**
 * EMAIL REGEX
 */
const EMAIL_REGEX =
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/gi;

/**
 * BAD EMAIL FILTERS
 */
const INVALID_EMAIL_PATTERNS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".svg",
  ".gif",
];

/**
 * NORMALIZE URL
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
 * FETCH HTML
 */
const fetchHTML = async (
  url,
) => {
  try {
    const response =
      await axios.get(url, {
        timeout: REQUEST_TIMEOUT,
        headers: {
          "User-Agent":
            "Mozilla/5.0",
        },
        maxRedirects: 5,
      });

    return response.data;
  } catch {
    return null;
  }
};

/**
 * EXTRACT EMAILS
 */
const extractEmailsFromHTML =
  (html) => {
    if (!html) return [];

    const foundEmails =
      html.match(EMAIL_REGEX) ||
      [];

    return [
      ...new Set(
        foundEmails
          .map((email) =>
            email
              .trim()
              .toLowerCase(),
          )
          .filter(Boolean)
          .filter(
            (email) =>
              !INVALID_EMAIL_PATTERNS.some(
                (pattern) =>
                  email.includes(
                    pattern,
                  ),
              ),
          ),
      ),
    ];
  };

/**
 * FIND CONTACT PAGES
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
    ].slice(0, 5);
  } catch {
    return [];
  }
};

/**
 * PROCESS SINGLE WEBSITE
 */
const processWebsite =
  async ({
    placeId,
    website,
  }) => {
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
       * DISCOVER CONTACT PAGES
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
       * FINAL RESPONSE
       */
      return {
        placeId,
        website:
          normalizedWebsite,

        emails: [
          ...new Set(allEmails),
        ],

        scannedPages: [
          normalizedWebsite,
          ...contactPages,
        ],

        success: true,
      };
    } catch {
      return {
        placeId,
        website,
        emails: [],
        scannedPages: [],
        success: false,
      };
    }
  };

/**
 * MAIN EXPORTABLE SERVICE
 */
const enrichWebsiteEmails =
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
       * CONCURRENCY LIMITER
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
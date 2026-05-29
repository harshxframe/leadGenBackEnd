import axios from "axios";
import * as cheerio from "cheerio";
import pLimit from "p-limit";

/**
 * ============================================
 * KOREXBASE FAST EMAIL ENRICHMENT ENGINE
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
 * - processing metrics
 * - lightweight architecture
 * - scalable enrichment infra
 * - mailto extraction
 * - unicode cleanup
 * - anti-noise filters
 *
 * ============================================
 * INPUT
 * ============================================
 *
 * [
 *   {
 *     placeId,
 *     website
 *   }
 * ]
 *
 * ============================================
 * OUTPUT
 * ============================================
 *
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

const REQUEST_TIMEOUT = 5000;

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
  "sales",
  "reservation",
  "booking",
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
  "press",
  "media",
  "events",
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
  "errors.",
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
 * CLEAN HTML
 * ============================================
 */

const cleanHTML = (html) => {
  try {
    if (!html) return "";

    return html
      .replace(/u003c/g, "")
      .replace(/u003e/g, "")
      .replace(/\\u003c/g, "")
      .replace(/\\u003e/g, "")
      .replace(/&lt;/g, "")
      .replace(/&gt;/g, "");
  } catch {
    return html;
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

          Accept:
            "text/html,application/xhtml+xml",
        },

        maxRedirects: 5,

        validateStatus: (status) =>
          status >= 200 &&
          status < 400,
      });

    return cleanHTML(
      response.data,
    );
  } catch {
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

    /**
     * MUST CONTAIN @
     */
    if (
      !normalized.includes("@")
    ) {
      return false;
    }

    /**
     * MINIMUM LENGTH
     */
    if (
      normalized.length < 6
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
 * EXTRACT MAILTO EMAILS
 * ============================================
 */

const extractMailtoEmails = (
  html,
) => {
  try {
    const $ = cheerio.load(html);

    const emails = [];

    $("a").each((_, el) => {
      const href =
        $(el).attr("href");

      if (
        href &&
        href.startsWith(
          "mailto:",
        )
      ) {
        const extracted =
          href
            .replace(
              "mailto:",
              "",
            )
            .split("?")[0]
            .trim()
            .toLowerCase();

        if (
          isValidEmail(
            extracted,
          )
        ) {
          emails.push(
            extracted,
          );
        }
      }
    });

    return [
      ...new Set(emails),
    ];
  } catch {
    return [];
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

      const regexEmails =
        html.match(
          EMAIL_REGEX,
        ) || [];

      const mailtoEmails =
        extractMailtoEmails(
          html,
        );

      return [
        ...new Set(
          [
            ...regexEmails,
            ...mailtoEmails,
          ]
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

      /**
       * SKIP JAVASCRIPT
       */
      if (
        href.startsWith(
          "javascript:",
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

        /**
         * SAME DOMAIN ONLY
         */
        const baseDomain =
          new URL(
            baseWebsite,
          ).hostname;

        const pageDomain =
          new URL(
            absoluteUrl,
          ).hostname;

        if (
          baseDomain !==
          pageDomain
        ) {
          return;
        }

        links.push(
          absoluteUrl,
        );
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
 * SORT EMAILS
 * ============================================
 */

const sortEmailsByPriority = (
  emails,
) => {
  try {
    return emails.sort(
      (a, b) => {
        if (
          a.confidence ===
            "high" &&
          b.confidence !==
            "high"
        ) {
          return -1;
        }

        if (
          b.confidence ===
            "high" &&
          a.confidence !==
            "high"
        ) {
          return 1;
        }

        return 0;
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

      /**
       * SORT PRIORITY
       */
      const sortedEmails =
        sortEmailsByPriority(
          structuredEmails,
        );

      return {
        placeId,

        website:
          normalizedWebsite,

        emails:
          sortedEmails,

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


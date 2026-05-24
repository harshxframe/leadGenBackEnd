import crypto from "crypto";

/**
 * ============================================
 * BUILD FINAL LEADS
 * ============================================
 */

export const buildFinalLeads = ({
  leads = [],
  selectedFields = {},
}) => {
  /**
   * ============================================
   * SAFETY
   * ============================================
   */

  if (!Array.isArray(leads)) {
    return [];
  }

  /**
   * ============================================
   * HELPERS
   * ============================================
   */

  const getField = (...values) => {
    for (const value of values) {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        return value;
      }
    }

    return null;
  };

  const cleanArray = (arr = []) => {
    if (!Array.isArray(arr)) {
      return [];
    }

    return [
      ...new Set(
        arr.filter(Boolean),
      ),
    ];
  };

  /**
   * ============================================
   * DEDUPLICATION
   * ============================================
   */

  const dedupedMap = new Map();

  for (const lead of leads) {
    if (
      !lead ||
      typeof lead !== "object"
    ) {
      continue;
    }

    const uniqueKey =
      lead.place_id ||
      lead.cid ||
      crypto.randomUUID();

    if (!dedupedMap.has(uniqueKey)) {
      dedupedMap.set(uniqueKey, lead);
    }
  }

  const uniqueLeads = [
    ...dedupedMap.values(),
  ];

  /**
   * ============================================
   * LEAD SCORING
   * ============================================
   */

  const calculateLeadScore = (
    lead,
  ) => {
    let score = 0;

    if (
      getField(
        lead.web_site,
        lead.website,
      )
    ) {
      score += 20;
    }

    if (lead.phone) {
      score += 15;
    }

    if (
      Array.isArray(
        lead.emails,
      ) &&
      lead.emails.length > 0
    ) {
      score += 25;
    }

    const rating = getField(
      lead.review_rating,
      lead.rating,
    );

    if (rating >= 4) {
      score += 15;
    }

    const reviews =
      getField(
        lead.review_count,
        lead.reviews_count,
        lead.reviews,
      ) || 0;

    if (reviews > 100) {
      score += 25;
    }

    return {
      score,

      quality:
        score >= 80
          ? "high"
          : score >= 50
          ? "medium"
          : "low",
    };
  };

  /**
   * ============================================
   * FINAL LEADS
   * ============================================
   */

  return uniqueLeads.map(
    (lead) => {
      const finalLead = {
        placeId:
          getField(
            lead.place_id,
          ),

        cid:
          getField(
            lead.cid,
          ),

        meta: {
          source:
            "google_maps",

          processedAt:
            new Date(),
        },

        /**
         * ============================================
         * BASIC INFO
         * ============================================
         */

        basicInfo:
          selectedFields.basicInfo
            ? {
                name:
                  getField(
                    lead.title,
                    lead.name,
                  ),

                category:
                  getField(
                    lead.category,
                  ),

                categories:
                  Array.isArray(
                    lead.categories,
                  )
                    ? lead.categories
                    : [],

                description:
                  getField(
                    lead.description,
                  ),

                rating:
                  getField(
                    lead.review_rating,
                    lead.rating,
                  ),

                reviewsCount:
                  getField(
                    lead.review_count,
                    lead.reviews_count,
                    lead.reviews,
                  ) || 0,

                status:
                  getField(
                    lead.status,
                  ),

                priceRange:
                  getField(
                    lead.price_range,
                  ),
              }
            : null,

        /**
         * ============================================
         * CONTACT INFO
         * ============================================
         */

        contactInfo:
          selectedFields.contactInfo
            ? {
                phone:
                  getField(
                    lead.phone,
                  ),

                website:
                  getField(
                    lead.web_site,
                    lead.website,
                  ),

                menu:
                  getField(
                    lead.menu
                      ?.link,
                  ),

                reservations:
                  getField(
                    lead.reservations,
                  ),

                orderOnline:
                  getField(
                    lead.order_online,
                  ),
              }
            : null,

        /**
         * ============================================
         * LOCATION DATA
         * ============================================
         */

        locationData:
          selectedFields.locationData
            ? {
                address:
                  getField(
                    lead.address,
                  ),

                street:
                  getField(
                    lead
                      .complete_address
                      ?.street,
                  ),

                borough:
                  getField(
                    lead
                      .complete_address
                      ?.borough,
                  ),

                city:
                  getField(
                    lead
                      .complete_address
                      ?.city,
                    lead.city,
                  ),

                state:
                  getField(
                    lead
                      .complete_address
                      ?.state,
                    lead.state,
                  ),

                country:
                  getField(
                    lead
                      .complete_address
                      ?.country,
                    lead.country,
                  ),

                postalCode:
                  getField(
                    lead
                      .complete_address
                      ?.postal_code,
                  ),

                latitude:
                  getField(
                    lead.latitude,
                  ),

                longitude:
                  getField(
                    lead.longtitude,
                    lead.longitude,
                  ),

                plusCode:
                  getField(
                    lead.plus_code,
                  ),

                timezone:
                  getField(
                    lead.timezone,
                  ),
              }
            : null,

        /**
         * ============================================
         * EMAILS
         * ============================================
         */

        emails:
          selectedFields.emails
            ? cleanArray(
                lead.emails,
              )
            : null,

        /**
         * ============================================
         * REVIEWS
         * ============================================
         */

        reviews:
          selectedFields.reviews
            ? Array.isArray(
                lead.user_reviews,
              )
              ? lead.user_reviews
              : []
            : null,

        /**
         * ============================================
         * REVIEW ANALYTICS
         * ============================================
         */

        reviewAnalytics:
          selectedFields.reviewAnalytics
            ? {
                reviewsPerRating:
                  getField(
                    lead.reviews_per_rating,
                  ) || {},

                totalReviews:
                  getField(
                    lead.review_count,
                  ) || 0,
              }
            : null,

        /**
         * ============================================
         * IMAGES
         * ============================================
         */

        images:
          selectedFields.images
            ? Array.isArray(
                lead.images,
              )
              ? lead.images.map(
                  (img) => ({
                    title:
                      img.title ||
                      null,

                    image:
                      img.image ||
                      null,
                  }),
                )
              : []
            : null,

        /**
         * ============================================
         * OWNER INFO
         * ============================================
         */

        ownerInfo:
          selectedFields.ownerInfo
            ? {
                ownerId:
                  getField(
                    lead.owner
                      ?.id,
                  ),

                ownerName:
                  getField(
                    lead.owner
                      ?.name,
                  ),

                ownerLink:
                  getField(
                    lead.owner
                      ?.link,
                  ),
              }
            : null,

        /**
         * ============================================
         * SOCIAL LINKS
         * ============================================
         */

        socialLinks:
          selectedFields.socialLinks
            ? lead.social_links ||
              {}
            : null,

        /**
         * ============================================
         * BOOKING PLATFORMS
         * ============================================
         */

        bookingPlatforms:
          selectedFields.bookingPlatforms
            ? {
                bookingCom:
                  null,

                airbnb:
                  null,

                agoda:
                  null,

                makemytrip:
                  null,
              }
            : null,

        /**
         * ============================================
         * SEO DATA
         * ============================================
         */

        seoData:
          selectedFields.seoData
            ? {
                hasWebsite:
                  !!getField(
                    lead.web_site,
                    lead.website,
                  ),

                hasSSL:
                  getField(
                    lead.web_site,
                    lead.website,
                  )?.startsWith(
                    "https",
                  ) || false,
              }
            : null,

        /**
         * ============================================
         * TECH STACK
         * ============================================
         */

        techStack:
          selectedFields.techStack
            ? Array.isArray(
                lead.tech_stack,
              )
              ? lead.tech_stack
              : []
            : null,

        /**
         * ============================================
         * ADS RUNNING
         * ============================================
         */

        adsRunning:
          selectedFields.adsRunning
            ? {
                googleAds:
                  false,

                metaAds:
                  false,
              }
            : null,

        /**
         * ============================================
         * WHATSAPP NUMBER
         * ============================================
         */

        whatsappNumber:
          selectedFields.whatsappNumber
            ? getField(
                lead.whatsapp_number,
              )
            : null,

        /**
         * ============================================
         * AI INSIGHTS
         * ============================================
         */

        aiInsights:
          selectedFields.aiInsights
            ? {
                growthPotential:
                  null,

                businessWeakness:
                  null,

                outreachAngle:
                  null,
              }
            : null,

        /**
         * ============================================
         * AI OUTREACH
         * ============================================
         */

        aiOutreach:
          selectedFields.aiOutreach
            ? {
                businessSummary:
                  null,

                outreachMessage:
                  null,
              }
            : null,

        /**
         * ============================================
         * LEAD SCORING
         * ============================================
         */

        leadScoring:
          selectedFields.leadScoring
            ? calculateLeadScore(
                lead,
              )
            : null,
      };

      return finalLead;
    },
  );
};
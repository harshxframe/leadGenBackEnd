import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    /**
     * =================================
     * RELATIONS
     * =================================
     */

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeadJobs",
      required: true,
      index: true,
    },

    /**
     * =================================
     * CORE IDS
     * =================================
     */

    placeId: {
      type: String,
      required: true,
      index: true,
    },

    cid: {
      type: String,
      default: null,
    },

    /**
     * =================================
     * META
     * =================================
     */

    meta: {
      source: {
        type: String,
        default: "google_maps",
      },

      processedAt: {
        type: Date,
        default: Date.now,
      },
    },

    /**
     * =================================
     * BASIC INFO
     * =================================
     */

    basicInfo: {
      name: String,

      category: String,

      categories: [String],

      description: String,

      rating: Number,

      reviewsCount: Number,

      status: String,

      priceRange: String,
    },

    /**
     * =================================
     * CONTACT INFO
     * =================================
     */

    contactInfo: {
      phone: String,

      whatsappNumber: String,

      website: String,

      emails: [String],
    },

    /**
     * =================================
     * LOCATION DATA
     * =================================
     */

    locationData: {
      address: String,

      street: String,

      borough: String,

      city: {
        type: String,
        index: true,
      },

      state: String,

      country: String,

      postalCode: String,

      latitude: Number,

      longitude: Number,

      plusCode: String,

      timezone: String,
    },

    /**
     * =================================
     * REVIEWS
     * ONLY 2 REVIEWS
     * =================================
     */

    reviews: [
      {
        reviewerName: String,

        reviewerPhoto: String,

        rating: Number,

        description: String,

        images: [String],

        when: String,
      },
    ],

    /**
     * =================================
     * REVIEW ANALYTICS
     * =================================
     */

    reviewAnalytics: {
      totalReviews: Number,

      reviewsPerRating: {
        1: Number,
        2: Number,
        3: Number,
        4: Number,
        5: Number,
      },
    },

    /**
     * =================================
     * IMAGES
     * ONLY 2 IMAGES
     * =================================
     */

    images: [
      {
        title: String,

        image: String,
      },
    ],

    /**
     * =================================
     * OWNER INFO
     * =================================
     */

    ownerInfo: {
      ownerId: String,

      ownerName: String,

      ownerLink: String,
    },

    /**
     * =================================
     * SOCIAL LINKS
     * =================================
     */

    socialLinks: {
      instagram: String,

      facebook: String,

      linkedin: String,

      twitter: String,

      youtube: String,
    },

    /**
     * =================================
     * BOOKING PLATFORMS
     * =================================
     */

    bookingPlatforms: {
      bookingCom: String,

      airbnb: String,

      agoda: String,

      makemytrip: String,
    },

    /**
     * =================================
     * SEO DATA
     * =================================
     */

    seoData: {
      hasWebsite: Boolean,

      hasSSL: Boolean,
    },

    /**
     * =================================
     * TECH STACK
     * =================================
     */

    techStack: [String],

    /**
     * =================================
     * ADS RUNNING
     * =================================
     */

    adsRunning: {
      googleAds: Boolean,

      metaAds: Boolean,
    },

    /**
     * =================================
     * AI INSIGHTS
     * =================================
     */

    aiInsights: {
      growthPotential: String,

      businessWeakness: String,

      outreachAngle: String,
    },

    /**
     * =================================
     * AI OUTREACH
     * =================================
     */

    aiOutreach: {
      businessSummary: String,

      outreachMessage: String,
    },

    /**
     * =================================
     * LEAD SCORING
     * =================================
     */

    leadScoring: {
      score: Number,

      quality: {
        type: String,
        enum: ["low", "medium", "high"],
      },
    },

    /**
     * =================================
     * QUICK FLAGS
     * =================================
     */

    flags: {
      hasPhone: Boolean,

      hasWebsite: Boolean,

      hasEmails: Boolean,

      hasReviews: Boolean,

      hasImages: Boolean,

      hasOwnerInfo: Boolean,
    },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

/**
 * =================================
 * INDEXES
 * =================================
 */

leadSchema.index({
  "basicInfo.category": 1,
});

leadSchema.index({
  "locationData.city": 1,
});

leadSchema.index({
  "leadScoring.score": -1,
});

leadSchema.index({
  createdAt: -1,
});

const Leads = mongoose.model("Leads", leadSchema);

export default Leads;

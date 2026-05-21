import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    // USER
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // UNIQUE JOB ID
    jobId: {
      type: String,
      required: true,
      unique: true,
    },

    // REQUEST SOURCE
    requestSource: {
      type: String,
      enum: ["dashboard", "api"],
      default: "dashboard",
    },

    // JOB STATUS
    status: {
      type: String,
      enum: ["queued", "processing", "completed", "failed"],
      default: "queued",
    },

    // SEARCH INPUT
    businessNiche: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    keywords: [
      {
        type: String,
        trim: true,
      },
    ],

    // LEAD LIMIT
    leadLimit: {
      type: Number,
      required: true,
    },

    // WHAT USER WANTS
    selectedFields: {
      basicInfo: {
        type: Boolean,
        default: true,
      },

      emails: {
        type: Boolean,
        default: false,
      },

      reviews: {
        type: Boolean,
        default: false,
      },

      images: {
        type: Boolean,
        default: false,
      },

      ownerInfo: {
        type: Boolean,
        default: false,
      },

      socialLinks: {
        type: Boolean,
        default: false,
      },

      aiOutreach: {
        type: Boolean,
        default: false,
      },
    },

    // RESULTS
    totalLeadsFound: {
      type: Number,
      default: 0,
    },

    // CREDIT SYSTEM
    creditsUsed: {
      type: Number,
      default: 0,
    },

    // JOB ERRORS
    errorMessage: {
      type: String,
      default: "",
    },

    // JOB TIMINGS
    startedAt: {
      type: Date,
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const LeadJobs = mongoose.model("LeadJobs", jobSchema);

export default LeadJobs;

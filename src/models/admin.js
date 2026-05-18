import mongoose from "mongoose";

const platformSettingsSchema = new mongoose.Schema(
  {
    maintenance: {
      type: Boolean,
      default: false,
    },

    newSignUpAllow: {
      type: Boolean,
      default: true,
    },

    newLoginAllow: {
      type: Boolean,
      default: true,
    },

    apiRequestAllow: {
      type: Boolean,
      default: true,
    },

    newRequestAllowed: {
      type: Boolean,
      default: true,
    },

    scraperEnabled: {
      type: Boolean,
      default: true,
    },

    emailNotifications: {
      type: Boolean,
      default: true,
    },

    freeCredit: {
      type: Number,
      default: 5,
    },

    maxLeadLimit: {
      type: Number,
      default: 500,
    },

    maxConcurrentJobs: {
      type: Number,
      default: 3,
    },

    creditRules: {
      small: {
        type: Number,
        default: 1,
      },

      medium: {
        type: Number,
        default: 2,
      },

      large: {
        type: Number,
        default: 4,
      },

      huge: {
        type: Number,
        default: 6,
      },
    },

    announcement: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const PlatformSettings = mongoose.model(
  "PlatformSettings",
  platformSettingsSchema,
);

export default PlatformSettings;
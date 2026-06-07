import mongoose from "mongoose";


const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    checkoutId: {
      type: String,
    },

    provider: {
      type: String,
      default: "lemonsqueezy"
    },

    credits: {
      type: Number,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "USD",
    },

    packageName: {
      type: String,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "completed",
        "refunded",
        "failed",
      ],
      default: "completed",
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const Transaction = mongoose.model(
  "Transaction",
  transactionSchema
);
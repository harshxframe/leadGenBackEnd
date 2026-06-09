import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { responseBody } from "../utils/responseBody.js";
import { paymentHistoryService } from "../services/databaseService.js";
import User from "../models/user.js";

const VARIANTS = {
  50: process.env.LEMON_VARIANT_50,
  150: process.env.LEMON_VARIANT_150,
  500: process.env.LEMON_VARIANT_500,
};

export const createLemonSqeezeCheckOut = async (req, res) => {
  try {
    const { credits, userId, name = null, email = null } = req.body || {};
    const variantId = VARIANTS[credits];

    if (!name || !email) {
      return res
        .status(400)
        .send(responseBody(true, false, 400, "Payload not satisifed", {}));
    }

    if (!variantId) {
      return res
        .status(400)
        .send(responseBody(true, false, 400, "Invalid credit package", {}));
    }

    const checkout = await createCheckout(
      process.env.LEMON_STORE_ID,
      variantId,
      {
        productOptions: {
          enabledVariants: [Number(variantId)],
        },
        checkoutOptions: {
          embed: true,
        },
        checkoutData: {
          email: email,
          name: name,
          custom: {
            userId: userId.toString(),
            credits: credits.toString(),
          },
        },
      },
    );

    const checkoutUrl = checkout?.data?.data?.attributes?.url;
    return res.status(200).send(
      responseBody(false, true, 200, "Checkout created", {
        checkoutUrl: checkoutUrl,
      }),
    );
  } catch (e) {
    return res
      .status(500)
      .send(responseBody(true, false, 500, e.message || "Server Error", {}));
  }
};

export const createRazorpayCheckOut = async (req, res) => {
  res.send("Comming soon");
};

export const paymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, userId } = req.body || {};
    const finalPage = Number(page) || 1;
    const finalLimit = Number(limit) || 10;
    const skip = (finalPage - 1) * finalLimit;

    const isSuccess = await paymentHistoryService(
      userId,
      finalPage,
      finalLimit,
      skip,
    );
    if (isSuccess.success) {
      return res
        .status(200)
        .send(
          responseBody(false, true, 200, isSuccess.message, isSuccess.data),
        );
    }
    return res
      .status(400)
      .send(
        responseBody(
          true,
          false,
          400,
          isSuccess.message || "Failed to get transactions",
          {},
        ),
      );
  } catch (e) {
    return res
      .status(500)
      .send(responseBody(true, false, 500, e.message || "Server Error", {}));
  }
};

export const getCredits = async (req, res) => {
  try {
    const { userId } = req.body || {};
    const getCredits = await User.findById(userId).select("credits _id").lean();
    if (!getCredits) {
      return res
        .status(400)
        .send(responseBody(false, true, 400, "Failed to get credits", {}));
    }

    return res.status(200).send(
      responseBody(false, true, 200, "Credit get succesfull", {
        credits: getCredits?.credits,
      }),
    );
  } catch (e) {
    return res
      .status(500)
      .send(responseBody(true, false, 500, e.message || "Server Error", {}));
  }
};

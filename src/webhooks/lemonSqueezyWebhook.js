import { Transaction } from "../models/transaction.js";
import User from "../models/user.js";
import logger from "../utils/logger.js";
import { sendTelegramAlert } from "../utils/telegramAlert.js";

export const lemonSqueezyWebhook = async (req, res) => {
  try {
    const eventName = req.body?.meta?.event_name;

    // Ignore all other events
    if (eventName !== "order_created") {
      return res.sendStatus(200);
    }

    const userId = req.body?.meta?.custom_data?.user_id;

    const credits = Number(req.body?.meta?.custom_data?.credits);

    const orderId = req.body?.data?.id;

    const amount = req.body?.data?.attributes?.total_usd / 100;

    const currency = req.body?.data?.attributes?.currency;

    // Validation
    if (!userId || !credits || !orderId) {
      logger.error("Invalid webhook payload");

      return res.sendStatus(400);
    }

    // Idempotency protection
    const existingTransaction = await Transaction.findOne({
      orderId,
    });

    if (existingTransaction) {
      return res.sendStatus(200);
    }

    // Verify user exists
    const user = await User.findById(userId);

    if (!user) {
      logger.error(`User not found: ${userId}`);

      return res.sendStatus(200);
    }

    // Create transaction record
    await Transaction.create({
      userId,
      orderId,
      credits,
      amount,
      currency,
      provider: "lemonsqueezy",
      status: "completed",
    });

    // Add credits
    await User.findByIdAndUpdate(userId, {
      $inc: {
        credits,
      },
    });

    logger.info(`Credits Added | User: ${userId} | Credits: ${credits}`);
    sendTelegramAlert(
      `💰 NEW SALE
       💸 Amount: ₹${amount || "000"}
       📦 Plan: ${planName || "NOT_AVL"}

       🎉 Payment Successful`
    );

    return res.sendStatus(200);
  } catch (e) {
    logger.error("Webhook Error:", e);

    return res.sendStatus(500);
  }
};

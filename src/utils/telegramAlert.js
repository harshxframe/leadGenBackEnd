import dotenv from "dotenv";
import logger from "./logger.js"
dotenv.config();


const TELEGRAM_BOT_TOKEN = "8765280688:AAGx0qXcswfdIDE0egg7zJZ8HNQkR_Bwd7Y" || process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = "5858123367" || process.env.TELEGRAM_CHAT_ID;

export const sendTelegramAlert = async (message) => {
  try {
    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
        }),
      }
    );
  } catch (error) {
logger.error("Telegram Alert Error", {
  message: error.message,
  cause: error.cause,
  stack: error.stack
});  }
};




// middlewares/adminSettingsMiddleware.js
import { getAdminSettings } from "../services/redisService.js";
import { responseBody } from "../utils/responseBody.js";

// Factory function jo alag alag checks ke liye middleware banata hai
const checkSetting = (settingKey, errorMessage, expectedValue = true) => {
  return async (req, res, next) => {
    try {
      const settings = await getAdminSettings();
      
      // Agar setting match nahi karti (e.g. maintenance true hai, ya allow false hai)
      if (settings[settingKey] !== expectedValue) {
        return res
          .status(403)
          .send(responseBody(true, false, 403, errorMessage, {}));
      }
      
      next();
    } catch (error) {
      return res
        .status(500)
        .send(responseBody(true, false, 500, "Internal Server Error", {}));
    }
  };
};

export const checkEmailNotificationsEnabled = async (req, res, next) => {
  try {
    const settings = await getAdminSettings();
    if (!settings.emailNotifications) {
      return res
        .status(403)
        .send(responseBody(true, false, 403, "Email notifications are disabled globally", {}));
    }
    next();
  } catch (e) {
    return handleMiddlewareError(res, e);
  }
};

// Saare settings ke middlewares ek hi jagah se export karein
export const checkNewSignUp = checkSetting("newSignUpAllow", "We are not accepting new accounts.");
export const checkNewLogin = checkSetting("newLoginAllow", "We are not accepting new logins.");
export const checkMaintenance = checkSetting("maintenance", "Site is under maintenance.", false); // Yahan false expected hai
export const checkApiRequest = checkSetting("apiRequestAllow", "API requests are currently disabled.");
export const checkNewRequest = checkSetting("newRequestAllowed", "New requests are not allowed at the moment.");
export const checkScraper = checkSetting("scraperEnabled", "Scraper service is currently disabled.");

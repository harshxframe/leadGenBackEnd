import { responseBody } from "../utils/responseBody.js";
import PlatformSettings from "../models/admin.js";
import {
  clearPlatformSettingsCache,
  getAdminSettings,
} from "../services/redisService.js";
import User from "../models/user.js";
import values from "../config/values.js";
import { contactRequestTemplate } from "../utils/emailTamplates.js";
import sendEmail from "../services/emailService.js";
import sendMailJetEmail from "../services/mailJetEmailService.js";
import logger from "../utils/logger.js";



export const updateAdminSettings = async (req, res) => {
  try {
    const {
      creditRules,
      announcement,
      apiRequestAllow,
      emailNotifications,
      freeCredit,
      maintenance,
      maxConcurrentJobs,
      maxLeadLimit,
      newLoginAllow,
      newRequestAllowed,
      newSignUpAllow,
      scraperEnabled,
    } = req.body || {};

    // 1. Validation: Reject if absolutely no update values are provided
    if (
      creditRules === undefined &&
      announcement === undefined &&
      apiRequestAllow === undefined &&
      emailNotifications === undefined &&
      freeCredit === undefined &&
      maintenance === undefined &&
      maxConcurrentJobs === undefined &&
      maxLeadLimit === undefined &&
      newLoginAllow === undefined &&
      newRequestAllowed === undefined &&
      newSignUpAllow === undefined &&
      scraperEnabled === undefined
    ) {
      return res
        .status(400)
        .send(
          responseBody(
            true,
            false,
            400,
            "Payload not satisfied: No fields provided to update",
            {},
          ),
        );
    }

    // 2. Collect provided values into a dynamic update object
    const updateData = {};

    // Handle nested object
    if (creditRules && typeof creditRules === "object") {
      //updateData.creditRules = {};
      if (creditRules.huge !== undefined)
        updateData["creditRules.huge"] = creditRules.huge;
      if (creditRules.large !== undefined)
        updateData["creditRules.large"] = creditRules.large;
      if (creditRules.medium !== undefined)
        updateData["creditRules.medium"] = creditRules.medium;
      if (creditRules.small !== undefined)
        updateData["creditRules.small"] = creditRules.small;
    }

    // Handle string and number fields
    if (announcement !== undefined) updateData.announcement = announcement;
    if (freeCredit !== undefined) updateData.freeCredit = freeCredit;
    if (maxConcurrentJobs !== undefined)
      updateData.maxConcurrentJobs = maxConcurrentJobs;
    if (maxLeadLimit !== undefined) updateData.maxLeadLimit = maxLeadLimit;

    // Handle boolean fields safely
    if (apiRequestAllow !== undefined)
      updateData.apiRequestAllow = apiRequestAllow;
    if (emailNotifications !== undefined)
      updateData.emailNotifications = emailNotifications;
    if (maintenance !== undefined) updateData.maintenance = maintenance;
    if (newLoginAllow !== undefined) updateData.newLoginAllow = newLoginAllow;
    if (newRequestAllowed !== undefined)
      updateData.newRequestAllowed = newRequestAllowed;
    if (newSignUpAllow !== undefined)
      updateData.newSignUpAllow = newSignUpAllow;
    if (scraperEnabled !== undefined)
      updateData.scraperEnabled = scraperEnabled;

    // 3. Execute MongoDB Update (Targeting your specific settings ID)
    const settingsId = "6a0bd63d0be693d30af31d5d";
    const updatedSettings = await PlatformSettings.findByIdAndUpdate(
      settingsId,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!updatedSettings) {
      return res
        .status(404)
        .send(
          responseBody(
            true,
            false,
            404,
            "Admin settings document not found",
            {},
          ),
        );
    }
    await clearPlatformSettingsCache();
    await getAdminSettings();
    return res
      .status(200)
      .send(
        responseBody(
          false,
          true,
          200,
          "Admin settings updated successfully",
          updatedSettings,
        ),
      );
  } catch (e) {
    return res
      .status(500)
      .send(responseBody(true, false, 500, e.message || "Server Error", {}));
  }
};

export const getAdminSettingsController = async (req, res) => {
  try {
    // 1. Target your specific settings ID
    const settingsId = "6a0bd63d0be693d30af31d5d";

    // 2. Query the database using your model
    const settings = await PlatformSettings.findById(settingsId);

    // 3. Handle case where the document does not exist yet
    if (!settings) {
      return res
        .status(404)
        .send(responseBody(true, false, 404, "Admin settings not found", {}));
    }

    // 4. Return the configuration data
    return res
      .status(200)
      .send(
        responseBody(
          false,
          true,
          200,
          "Admin settings fetched successfully",
          settings,
        ),
      );
  } catch (e) {
    return res
      .status(500)
      .send(responseBody(true, false, 500, e.message || "Server Error", {}));
  }
};

export const getAllUsers = async (req, res) => {
  try {
    let { page, limit } = req.query || {};

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    const skip = (page - 1) * limit;

    // 2. Fetch data and count total records concurrently for speed
    const [users, totalUsers] = await Promise.all([
      User.find().skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      User.countDocuments(),
    ]);

    const sanitizedUsers = users.map((user) => {
      delete user["_id"];
      delete user["createdAt"];
      delete user["updatedAt"];
      delete user["__v"];
      return user;
    });

    const totalPages = Math.ceil(totalUsers / limit);

    return res.status(200).send(
      responseBody(false, true, 200, "Users retrieved successfully", {
        users: sanitizedUsers,
        pagination: {
          totalUsers,
          totalPages,
          currentPage: page,
          limit,
        },
      }),
    );
  } catch (e) {
    return res
      .status(500)
      .send(responseBody(true, false, 500, e.message || "Server Error", {}));
  }
};

export const sendUserInquery = async (req, res) => {
  try {
    const { fullName, contactEmail, subject, message } = req.body || {};
    if (!fullName || !contactEmail || !subject || !message) {
      return res
        .status(400)
        .send(responseBody(true, false, 400, "Payload not satisfied", {}));
    }

    const adminName = values?.adminName;
    const adminEmail = values?.adminVarificationEmail;
    const emailTamplate = contactRequestTemplate({fullName:fullName, contactEmail:contactEmail, subject:subject, message:message});
    const ownerEMail = values?.ownerEMail;
    const ownerName = values?.ownerName;

    const isEmailSend = await sendEmail(
      adminEmail,
      adminName,
      ownerEMail,
      `New Contact Request from ${fullName}`,
      ownerName,
      emailTamplate,
    );

    let finalEmailResult = isEmailSend;

    if (!isEmailSend?.success) {
      logger.error("ZeptoMail failed. Trying Mailjet...");

      finalEmailResult = await sendMailJetEmail(
        adminEmail,
        adminName,
        ownerEMail,
        `New Contact Request from ${fullName}`,
        ownerName,
        emailTamplate,
      );
    }

    if (finalEmailResult.success) {
        return res
          .status(200)
          .send(responseBody(false, true, 200, "Message send successfully", {}));
    } else {
      return res
        .status(500)
        .send(
          responseBody(
            true,
            false,
            500,
            finalEmailResult.message || "Failed to send message",
            {},
          ),
        );
    }

  } catch (e) {
    return res
      .status(500)
      .send(responseBody(true, false, 500, e.message || "Server Error", {}));
  }
};

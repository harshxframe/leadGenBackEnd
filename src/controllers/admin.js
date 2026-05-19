import { responseBody } from "../utils/responseBody.js";
import PlatformSettings from "../models/admin.js";
import { clearPlatformSettingsCache, getAdminSettings } from "../services/redisService.js";

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

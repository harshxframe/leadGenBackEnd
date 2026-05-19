import PlatformSettings from "../models/admin.js";
import User from "../models/user.js";
import { serviceResponse } from "../utils/serviceResponseBody.js";

export const getPlatformSettingService = async () => {
  try {
    const isDataSettingsExist = await PlatformSettings.findOneAndUpdate(
      {},
      { $setOnInsert: {} },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );
    return serviceResponse(true, "Platform settings retrieved successfully", {
      platformSettings:isDataSettingsExist,
    });
  } catch (e) {
    return serviceResponse(false, e.message || "DB Error", {});
  }
};



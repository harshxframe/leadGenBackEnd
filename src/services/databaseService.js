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
      platformSettings: isDataSettingsExist,
    });
  } catch (e) {
    return serviceResponse(false, e.message || "DB Error", {});
  }
};

export const createAccountService = async (payload) => {
  try {
    const isUserExist = await User.findOne({ email: payload.email });
    if (isUserExist) {
      return serviceResponse(false, "User already exsit", {});
    }

    const createUser = await User.create(payload);
    if (!createUser) {
      return serviceResponse(false, "User to create account", {});
    }
    return serviceResponse(true, "User account created", { user: createUser });
  } catch (e) {
    return serviceResponse(false, e.message || "DB Error", {});
  }
};

export const loginAccountService = async (payload) => {
  try {
    const isUserExist = await User.findOneAndUpdate(
      { email: payload.email },
      { $set: { lastLoginAt: new Date().toISOString() } },
      { new: true },
    );
    if (!isUserExist) {
      return serviceResponse(false, "User does not exsit", {});
    }
    return serviceResponse(true, "User exsit", { user: isUserExist });
  } catch (e) {
    return serviceResponse(false, e.message || "DB Error", {});
  }
};

export const getUserService = async (id) => {
  try {
    console.log(id);
    const getUser = await User.findById(id);
    if (!getUser) {
      return serviceResponse(false, "User does not exsit", {});
    }
    return serviceResponse(true, "User exsit", { user: getUser });
  } catch (e) {
    return serviceResponse(false, e.message || "DB Error", {});
  }
};

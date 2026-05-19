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
    const getUser = await User.findById(id);
    if (!getUser) {
      return serviceResponse(false, "User does not exsit", {});
    }
    return serviceResponse(true, "User exsit", { user: getUser });
  } catch (e) {
    return serviceResponse(false, e.message || "DB Error", {});
  }
};

export const updateUserService = async (id, payload) => {
  try {
    const updateUser = await User.findByIdAndUpdate(id,{$set:payload},{new:true});
    if (!updateUser) {
      return serviceResponse(false, "Failed to update user", {});
    }
    return serviceResponse(true, "User updated successfull", { user: updateUser });
  } catch (e) {
    return serviceResponse(false, e.message || "DB Error", {});
  }
};

export const toggleBlockUserService = async (email, isBlocked) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { isBlocked },
      { new: true }
    );
    if (!updatedUser) {
      return serviceResponse(false, "User not found", {});
    }
    return serviceResponse(true, "Block status updated successfully", { user: updatedUser });
  } catch (e) {
    return serviceResponse(false, e.message || "DB Error", {});
  }
};

export const incrementSearchesService = async (id) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $inc: { totalSearches: 1 } },
      { new: true }
    );
    if (!updatedUser) {
      return serviceResponse(false, "User not found", {});
    }
    return serviceResponse(true, "Search incremented successfully", { user: updatedUser });
  } catch (e) {
    return serviceResponse(false, e.message || "DB Error", {});
  }
};

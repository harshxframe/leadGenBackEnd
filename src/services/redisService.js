import { client, otpKey, platformSettingsKey } from "../config/redisConfig.js";
import { getPlatformSettingService } from "./databaseService.js";


// Create a temp record to OTP varification
export const createOTPSession = async (email, code) => {
  try {
    const value = JSON.stringify({ email: email, code: code });
    const key = otpKey(email);

    // Redis handles the "exist" check and the write atomically in 1 step
    const result = await client.set(key, value, {
      EX: 120,
      NX: true,
    });

    // If result is 'OK', it was saved. If null, it already existed.
    return result === "OK";
  } catch (e) {
    throw new Error(e);
  }
};

export const verifyOTP = async (email, UserCode) => {
  try {
    const key = otpKey(email);
    const value = await client.get(key);

    if (value) {
      const { email, code } = JSON.parse(value);
      if (String(code) === String(UserCode)) {
        await client.del(key);
        return true;
      }
    }
    return false;
  } catch (e) {
    throw new Error(e);
  }
};

// Cache Platform settings
export const getAdminSettings = async () => {
  try {
    const key = platformSettingsKey();

    const cachedValue = await client.get(key);
    if (cachedValue) {
      return JSON.parse(cachedValue);
    }

    const platformSettings = await getPlatformSettingService();
    const valueStr = JSON.stringify(platformSettings.data.platformSettings);

    await client.set(key, valueStr, { EX: 86400 });
    return JSON.parse(valueStr);
  } catch (e) {
    throw new Error(e);
  }
};

export const clearPlatformSettingsCache = async () =>{
   try {
    const key = platformSettingsKey();
    await client.del(key);
    return true;
  } catch (e) {
    throw new Error(e);
  }
}

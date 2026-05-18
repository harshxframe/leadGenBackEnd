import { client, otpKey } from "../config/redisConfig.js";

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
    return false;
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
    return false;
  }
};


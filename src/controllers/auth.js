import { otpEmailTemplate } from "../utils/emailTamplates.js";
import { generateCode } from "../utils/generateCode.js";
import { responseBody } from "../utils/responseBody.js";
import { validateFormat } from "../utils/validateEmail.js";
import values from "../config/values.js";
import sendEmail from "../services/emailService.js";
import {
  createOTPSession,
  getAdminSettings,
  verifyOTP,
} from "../services/redisService.js";
import { generateApiKey } from "../utils/generateAPIKey.js";
import {
  createAccountService,
  getUserService,
  incrementSearchesService,
  loginAccountService,
  toggleBlockUserService,
  updateUserService,
} from "../services/databaseService.js";
import { generateToken, readToken } from "../utils/jwt.js";

export const createAccount = async (req, res) => {
  try {
    const { name, email, profession, emailVerified } = req.body || {};

    if (!name || !email || !profession || !emailVerified) {
      return res
        .status(400)
        .send(responseBody(true, false, 400, "Payload not satisfied", {}));
    }

    const credit = getAdminSettings().freeCredit || 5;
    const apiKey = generateApiKey();
    const finalPayload = {
      name: name,
      email: email,
      profession: profession,
      apiKey: apiKey,
      credits: credit,
      emailVerified: emailVerified,
      lastLoginAt: new Date().toISOString(),
    };

    const isSuccess = await createAccountService(finalPayload);
    if (isSuccess.success) {
      const token = generateToken(String(isSuccess.data.user?._id));
      return res.status(200).send(
        responseBody(false, true, 200, "Account created successfull", {
          token: token,
        }),
      );
    }
    return res
      .status(400)
      .send(
        responseBody(
          true,
          false,
          400,
          isSuccess.message || "Failed to create account",
          {},
        ),
      );
  } catch (e) {
    return res
      .status(500)
      .send(responseBody(true, false, 500, e.message || "Server Error", {}));
  }
};

export const loginAccount = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res
        .status(400)
        .send(responseBody(true, false, 400, "Payload not satisfied", {}));
    }
    //ready to login
    const isSuccess = await loginAccountService({ email });
    if (isSuccess.success) {
      const token = generateToken(String(isSuccess.data.user?._id));
      return res
        .status(200)
        .send(
          responseBody(false, true, 200, "Login successfull", { token: token }),
        );
    }
    return res
      .status(400)
      .send(
        responseBody(
          true,
          false,
          400,
          isSuccess.message || "Failed to login",
          {},
        ),
      );
  } catch (e) {
    return res
      .status(500)
      .send(responseBody(true, false, 500, e.message || "Server Error", {}));
  }
};

export const getUser = async (req, res) => {
  try {
    const { token } = req.body || {};
    if (!token) {
      return res
        .status(400)
        .send(responseBody(true, false, 400, "Payload not satisfied", {}));
    }

    // Get token
    const getId = readToken(token);
    if (!getId) {
      return res
        .status(403)
        .send(responseBody(true, false, 403, "Invalid token", {}));
    }

    const isSuccess = await getUserService(getId.id);
    if (isSuccess.success) {
      const userData = isSuccess.data?.user.toObject();
      delete userData["_id"];
      delete userData["createdAt"];
      delete userData["updatedAt"];
      delete userData["__v"];
      return res.status(200).send(
        responseBody(false, true, 200, "Get user successfull", {
          user: userData,
        }),
      );
    }
    return res
      .status(400)
      .send(
        responseBody(
          true,
          false,
          400,
          isSuccess.message || "Failed to get User",
          {},
        ),
      );
  } catch (e) {
    return res
      .status(500)
      .send(responseBody(true, false, 500, e.message || "Server Error", {}));
  }
};

export const updateUser = async (req, res) => {
  try {
    const { token, name, email, profession, credits } = req.body || {};
    if (!name && !email && !profession && !credits) {
      return res
        .status(400)
        .send(responseBody(true, false, 400, "Payload not satisfied", {}));
    }
    if (!token) {
      return res
        .status(400)
        .send(responseBody(true, false, 400, "Payload not satisfied", {}));
    }
    // Get token
    const getId = readToken(token);
    if (!getId) {
      return res
        .status(403)
        .send(responseBody(true, false, 403, "Invalid token", {}));
    }

    const updateObj = {};

    if (name !== undefined) updateObj["name"] = name;
    if (email !== undefined) updateObj["email"] = email;
    if (profession !== undefined) updateObj["profession"] = profession;
    if (credits !== undefined && !isNaN(Number(credits))) {
      updateObj["credits"] = Number(credits);
    }

    const isSuccess = await updateUserService(getId?.id, updateObj);
    if (isSuccess.success) {
      const userData = isSuccess.data?.user.toObject();
      delete userData["_id"];
      delete userData["createdAt"];
      delete userData["updatedAt"];
      delete userData["__v"];
      return res.status(200).send(
        responseBody(false, true, 200, "User updated successfull", {
          user: userData,
        }),
      );
    }
    return res
      .status(400)
      .send(
        responseBody(
          true,
          false,
          400,
          isSuccess.message || "Failed to update User",
          {},
        ),
      );
  } catch (e) {
    return res
      .status(500)
      .send(responseBody(true, false, 500, e.message || "Server Error", {}));
  }
};

export const toggleBlockUser = async (req, res) => {
  try {
    const { email, isBlocked } = req.body || {};

    const isValidEmail = typeof email === 'string' && email.includes('@') && email.trim().length > 3;
    const isValidBoolean = typeof isBlocked === 'boolean';

    if (!isValidEmail || !isValidBoolean) {
      return res.status(400).send(responseBody(true, false, 400, "Payload not satisfied", {}));
    }

    const isSuccess = await toggleBlockUserService(email.trim(), isBlocked);
    if (isSuccess.success) {
      // Inline Sanitization
      const userData = isSuccess.data.user.toObject();
      delete userData["_id"];
      delete userData["createdAt"];
      delete userData["updatedAt"];
      delete userData["__v"];

      return res.status(200).send(
        responseBody(false, true, 200, isSuccess.message, {
          user: userData,
        }),
      );
    }
    return res.status(400).send(responseBody(true, false, 400, isSuccess.message, {}));
  } catch (e) {
    return res.status(500).send(responseBody(true, false, 500, e.message || "Server Error", {}));
  }
};

// 2. Increment Searches Controller
export const incrementSearches = async (req, res) => {
  try {
    const { token } = req.body || {};

    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return res.status(400).send(responseBody(true, false, 400, "Token is required", {}));
    }

    const getId = readToken(token);
    if (!getId) {
      return res.status(403).send(responseBody(true, false, 403, "Invalid token", {}));
    }

    const isSuccess = await incrementSearchesService(getId.id);
    if (isSuccess.success) {
      // Inline Sanitization
      const userData = isSuccess.data.user.toObject();
      delete userData["_id"];
      delete userData["createdAt"];
      delete userData["updatedAt"];
      delete userData["__v"];

      return res.status(200).send(
        responseBody(false, true, 200, isSuccess.message, {
          user: userData,
        }),
      );
    }
    return res.status(400).send(responseBody(true, false, 400, isSuccess.message, {}));
  } catch (e) {
    return res.status(500).send(responseBody(true, false, 500, e.message || "Server Error", {}));
  }
};

export const sendVarificationCode = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res
        .status(400)
        .send(responseBody(true, false, 400, "Payload not satisfied", {}));
    }

    // Send the code to Email using Zepto Mail
    const isEmailValid = validateFormat(email);
    if (!isEmailValid) {
      return res
        .status(400)
        .send(responseBody(true, false, 400, "EMail is not valid", {}));
    }

    const adminName = values?.adminName;
    const adminEmail = values?.adminVarificationEmail;
    const oneTimePassowrd = generateCode(6);
    const emailTamplate = otpEmailTemplate(oneTimePassowrd);
    const isEmailSend = await sendEmail(
      adminEmail,
      adminName,
      email,
      `Verify your Korexbase account ${oneTimePassowrd}`,
      "User",
      emailTamplate,
    );

    if (isEmailSend.success) {
      const saveTempOtp = await createOTPSession(email, oneTimePassowrd);
      if (saveTempOtp) {
        return res
          .status(200)
          .send(responseBody(false, true, 200, "OTP send successfully", {}));
      }
      return res
        .status(400)
        .send(responseBody(true, false, 400, "Retry after 2 mins", {}));
    } else {
      return res
        .status(500)
        .send(
          responseBody(
            true,
            false,
            500,
            isEmailSend.message || "Failed to send email",
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

export const optVerification = async (req, res) => {
  try {
    const { email, code } = req.body || {};
    if (!email || !code) {
      return res
        .status(400)
        .send(responseBody(true, false, 400, "Payload not satisfied", {}));
    }

    const varifySessionsOtp = await verifyOTP(email, code);
    if (varifySessionsOtp) {
      return res
        .status(200)
        .send(
          responseBody(false, true, 200, "OTP verification successful", {}),
        );
    }
    return res
      .status(400)
      .send(responseBody(true, false, 400, "Request does not exsit", {}));
  } catch (e) {
    return res
      .status(500)
      .send(responseBody(true, false, 500, e.message || "Server Error", {}));
  }
};

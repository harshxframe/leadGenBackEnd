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

export const createAccount = async (req, res) => {
  try {
    const { name, email, profession, emailVerified, lastLoginAt } =
      req.body || {};

    if (!name || !email || !profession || !emailVerified || !lastLoginAt) {
      return res
        .status(400)
        .send(responseBody(true, false, 400, "Payload not satisfied", {}));
    }

    // apiKey and credit and
  } catch (e) {
    return res
      .status(500)
      .send(responseBody(true, false, 500, e.message || "Server Error", {}));
  }
};

export const loginAccount = (req, res) => {
  try {
  } catch (e) {}
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

// email.service.js
import { SendMailClient } from "zeptomail";
import dotenv from "dotenv";
dotenv.config();

const url = process.env.ZEPTO_MAIL_HOST;
const token = process.env.ZEPTO_MAIL_TOKEN;

const client = new SendMailClient({ url, token });

/**
 * Send an email and return a normalized result object so callers can easily inspect status.
 * @param {string} adminAddress - from address
 * @param {string} adminName - from name
 * @param {string} to - recipient email
 * @param {string} subject - email subject
 * @param {string} userName - recipient name
 * @param {string} emailBody - html body
 * @returns {Promise<{success:boolean, status?:number, message:string, raw?:any, error?:any}>}
 */

async function sendEmail(adminAddress, adminName, to, subject, userName, emailBody) {
  if (!adminAddress || !to || !subject || !emailBody) {
    return {
      success: false,
      message: "Missing required parameters (from/to/subject/htmlbody).",
      error: { code: "INVALID_PARAMETERS" }
    };
  }
  var payload = {};

    payload = {
      from: { address: adminAddress, name: adminName ?? "" },
      to: [
        { email_address: { address: to, name: userName ?? "" } }
      ],
      subject,
      htmlbody: emailBody,
    };
  
  try {
    const rawResponse = await client.sendMail(payload);
    
    return {
      success: true,
      status: rawResponse?.status || 200,
      message: "sent successfully.",
      raw: rawResponse
    };
  } catch (err) {
    const errorInfo = {
      message: err?.message ?? "Unknown error",
      code: err?.code,
      status: err?.status || err?.response?.status,
      details: err?.response?.data ?? err?.response ?? null
    };

    return {
      success: false,
      message: "Failed to send email.",
      error: errorInfo,
      raw: err
    };
  }
}

export default sendEmail;
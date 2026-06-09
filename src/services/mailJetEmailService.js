import Mailjet from "node-mailjet";
import dotenv from "dotenv";

dotenv.config();

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);

/**
 * Send email using Mailjet
 *
 * @param {string} adminAddress
 * @param {string} adminName
 * @param {string} to
 * @param {string} subject
 * @param {string} userName
 * @param {string} emailBody
 *
 * @returns {Promise<{
 *   success:boolean,
 *   status?:number,
 *   message:string,
 *   raw?:any,
 *   error?:any
 * }>}
 */
async function sendMailJetEmail(
  adminAddress,
  adminName,
  to,
  subject,
  userName,
  emailBody
) {
  if (!adminAddress || !to || !subject || !emailBody) {
    return {
      success: false,
      message: "Missing required parameters.",
      error: {
        code: "INVALID_PARAMETERS"
      }
    };
  }

  try {
    const response = await mailjet
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: {
              Email: adminAddress,
              Name: adminName ?? ""
            },

            To: [
              {
                Email: to,
                Name: userName ?? ""
              }
            ],

            Subject: subject,
            HTMLPart: emailBody
          }
        ]
      });

    const result = response.body?.Messages?.[0];

    if (result?.Status === "success") {
      return {
        success: true,
        status: 200,
        message: "Email sent successfully.",
        raw: response.body
      };
    }

    return {
      success: false,
      status: 400,
      message: "Mailjet rejected email.",
      error: result?.Errors || [],
      raw: response.body
    };
  } catch (err) {
    return {
      success: false,
      status: err?.statusCode || 500,
      message: "Failed to send email.",
      error: {
        message: err?.message,
        status: err?.statusCode,
        details: err?.response?.body || null
      },
      raw: err
    };
  }
}

export default sendMailJetEmail;
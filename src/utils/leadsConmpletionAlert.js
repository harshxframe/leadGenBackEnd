import values from "../config/values.js";
import { leadsCompletedEmailTemplate } from "./emailTamplates.js";
import sendEmail from "../services/emailService.js";

export const sendEmailHelperOnJobSuccess = async (
  userName,
  businessNiche,
  city,
  totalLeads,
  creditsUsed,
  email,
  processingTime,
  jobId
) => {
  try {
    const adminName = values?.adminName;
    const adminEmail = values?.adminVarificationEmail;
    const emailTamplate = leadsCompletedEmailTemplate({
      userName,
      businessNiche,
      city,
      totalLeads,
      creditsUsed,
      processingTime,
      jobId,
      dashboardUrl: values.dashboardUrl,
    });
    const isEmailSend = await sendEmail(
      adminEmail,
      adminName,
      email,
      `Your ${totalLeads} leads are ready 🚀`,
      userName,
      emailTamplate,
    );

    if (isEmailSend.success) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
};

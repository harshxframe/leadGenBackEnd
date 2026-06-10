export const otpEmailTemplate = (otpCode) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Korexbase Verification</title>
  </head>

  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #F8FAFC;
      font-family: Arial, sans-serif;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="padding: 40px 0;"
    >
      <tr>
        <td align="center">

          <table
            width="500"
            cellpadding="0"
            cellspacing="0"
            style="
              background: #FFFFFF;
              border-radius: 16px;
              padding: 40px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            "
          >

            <!-- LOGO / BRAND -->
            <tr>
              <td
                align="center"
                style="
                  font-size: 32px;
                  font-weight: bold;
                  color: #4F46E5;
                  padding-bottom: 10px;
                "
              >
                Korexbase
              </td>
            </tr>

            <!-- HEADING -->
            <tr>
              <td
                align="center"
                style="
                  font-size: 24px;
                  font-weight: bold;
                  color: #0F172A;
                  padding-top: 10px;
                "
              >
                Verify Your Email
              </td>
            </tr>

            <!-- DESCRIPTION -->
            <tr>
              <td
                align="center"
                style="
                  color: #64748B;
                  font-size: 16px;
                  line-height: 26px;
                  padding-top: 20px;
                "
              >
                Welcome to Korexbase.<br />
                Use the verification code below to continue securely.
              </td>
            </tr>

            <!-- OTP BOX -->
            <tr>
              <td align="center" style="padding: 35px 0;">
                <div
                  style="
                    display: inline-block;
                    background: #4F46E5;
                    color: #FFFFFF;
                    font-size: 36px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    padding: 18px 40px;
                    border-radius: 14px;
                  "
                >
                  ${otpCode}
                </div>
              </td>
            </tr>

            <!-- EXPIRY -->
            <tr>
              <td
                align="center"
                style="
                  color: #64748B;
                  font-size: 14px;
                  line-height: 24px;
                "
              >
                This OTP will expire in 5 minutes.
              </td>
            </tr>

            <!-- SECURITY NOTE -->
            <tr>
              <td
                align="center"
                style="
                  color: #94A3B8;
                  font-size: 13px;
                  line-height: 22px;
                  padding-top: 20px;
                "
              >
                If you did not request this verification code,
                you can safely ignore this email.
              </td>
            </tr>

            <!-- DIVIDER -->
            <tr>
              <td style="padding: 30px 0 20px 0;">
                <div
                  style="
                    height: 1px;
                    background: #E2E8F0;
                    width: 100%;
                  "
                ></div>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td
                align="center"
                style="
                  color: #94A3B8;
                  font-size: 13px;
                  line-height: 22px;
                "
              >
                © ${new Date().getFullYear()} Korexbase. All rights reserved.
                <br />
                AI Infrastructure for Modern Businesses
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

export const leadsCompletedEmailTemplate = ({
  userName,
  businessNiche,
  city,
  totalLeads,
  creditsUsed,
  processingTime,
  dashboardUrl,
  jobId,
}) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>Korexbase Leads Ready</title>
</head>
  <body
  style="
    margin: 0;
    padding: 0;
    background-color: #F8FAFC;
    font-family: Arial, sans-serif;
  "
>

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="
      padding: 40px 15px;
    "
  >
    <tr>
      <td align="center">

        <!-- MAIN CARD -->
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
         style="
  max-width: 560px;
  background: #FFFFFF;
  border-radius: 22px;
  padding: 32px 22px;
  box-shadow: 0 6px 28px rgba(0,0,0,0.08);
"
        >
<tr>
  <td align="center">

    <div
      style="
        display:inline-block;
        padding:8px 14px;
        background:#ECFDF5;
        color:#059669;
        border-radius:999px;
        font-size:13px;
        font-weight:600;
        letter-spacing:.5px;
      "
    >
      LEADS READY
    </div>

  </td>
</tr>
          <!-- BRAND -->
      <tr>
  <td
    align="center"
    style="
      font-size: 28px;
      font-weight: bold;
      color: #4F46E5;
      padding-top: 18px;
      letter-spacing: -1px;
    "
  >
    Korexbase
  </td>
</tr>

          <!-- HEADING -->
         <tr>
  <td
    align="center"
    style="
      font-size: 26px;
      font-weight: bold;
      color: #0F172A;
      padding-top: 14px;
      line-height: 34px;
    "
  >
    Your Leads Are Ready
  </td>
</tr>

          <!-- SUCCESS TEXT -->
         <tr>
  <td
    align="center"
    style="
      color:#64748B;
      font-size:14px;
      font-weight:500;
      padding-top:12px;
    "
  >
    Lead generation completed successfully
  </td>
</tr>

          <!-- DESCRIPTION -->
          <tr>
            <td
              align="center"
              style="
  color: #64748B;
  font-size: 16px;
  line-height: 26px;
  padding-top: 24px;
"
            >

              Hi ${userName || "User"},
              <br /><br />

              Your lead generation request has been processed successfully.

              Korexbase AI infrastructure generated fresh
              business leads for your outreach campaign.

            </td>
          </tr>

          <!-- STATS CARD -->
          <tr>
            <td style="padding-top: 28px;">

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
              style="
  background: #F8FAFC;
border:1px solid #E2E8F0;
border-radius:20px;
padding:20px;
"
              >

                <!-- BIG LEADS NUMBER -->
                <tr>
                  <td
                    align="center"
                    style="
                      padding-bottom: 30px;
                    "
                  >

                    <div
                      style="
  font-size: 46px;
  font-weight: bold;
  color: #4F46E5;
  line-height: 1;
"
                    >
                      ${totalLeads}
                    </div>

                    <div
                      style="
                        color: #64748B;
                        font-size: 15px;
                        margin-top: 12px;
                      "
                    >
                      Leads Generated
                    </div>

                  </td>
                </tr>

                <!-- STATS -->
                <tr>
                  <td
                    style="
                      padding: 12px 0;
                      color: #0F172A;
                      font-size: 15px;
                    "
                  >
                    <strong>Business Niche:</strong>
                    ${businessNiche}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding: 12px 0;
                      color: #0F172A;
                      font-size: 15px;
                    "
                  >
                    <strong>Target City:</strong>
                    ${city}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding: 12px 0;
                      color: #0F172A;
                      font-size: 15px;
                    "
                  >
                    <strong>Credits Used:</strong>
                    ${creditsUsed}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding: 12px 0;
                      color: #0F172A;
                      font-size: 15px;
                    "
                  >
                    <strong>Completed In:</strong>
                    ${processingTime}
                  </td>
                </tr>

                <!-- JOB ID -->
                <tr>
                  <td
                    style="
                      padding-top: 20px;
                      color: #64748B;
                      font-size: 13px;
                      line-height: 22px;
                      word-break: break-word;
                    "
                  >
                    Job ID: ${jobId}
                  </td>
                </tr>

              </table>

            </td>
          </tr>

          <!-- BUTTON -->
          <tr>
            <td
              align="center"
              style="
                padding-top: 42px;
              "
            >

              <a
                href="${dashboardUrl}"
                style="
                  display: inline-block;
                  background: #4F46E5;
                  color: #FFFFFF;
                  text-decoration: none;
                  font-size: 16px;
                  font-weight: bold;
                  padding: 17px 40px;
                  border-radius: 14px;
                  box-shadow: 0 8px 20px rgba(79,70,229,0.25);
                "
              >
                Open Dashboard
              </a>

            </td>
          </tr>

          <!-- NOTE -->
          <tr>
            <td
              align="center"
              style="
                color: #94A3B8;
                font-size: 13px;
                line-height: 24px;
                padding-top: 36px;
              "
            >
              This is an automated notification from Korexbase.
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
<td style="padding: 24px 0 16px 0;">
              <div
                style="
                  height: 1px;
                  background: #E2E8F0;
                  width: 100%;
                "
              ></div>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td
              align="center"
              style="
                color: #94A3B8;
                font-size: 13px;
                line-height: 26px;
              "
            >

              © ${new Date().getFullYear()} Korexbase.
              All rights reserved.

              <br />

              AI Infrastructure For Modern Businesses

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;
};

export const contactRequestTemplate = ({
fullName,
contactEmail,
subject,
message,
}) => {
return ` <!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>New Contact Request</title>
</head>

<body style="margin:0;padding:30px;background:#f5f7fa;font-family:Arial,sans-serif;color:#1e293b;">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<table
  width="600"
  cellpadding="0"
  cellspacing="0"
  style="
    background:#ffffff;
    border:1px solid #e5e7eb;
    border-radius:12px;
    padding:32px;
  "
>

<tr>
<td>

<div
  style="
    font-size:24px;
    font-weight:700;
    color:#111827;
    margin-bottom:6px;
  "
>
Korexbase
</div>

<div
  style="
    font-size:14px;
    color:#6b7280;
    margin-bottom:24px;
  "
>
New contact request received from your website.
</div>

<hr
  style="
    border:none;
    border-top:1px solid #e5e7eb;
    margin:24px 0;
  "
/>

<table width="100%" cellpadding="0" cellspacing="0">

<tr>
  <td style="padding:10px 0;width:120px;font-weight:600;">
    Name
  </td>
  <td style="padding:10px 0;">
    ${fullName}
  </td>
</tr>

<tr>
  <td style="padding:10px 0;font-weight:600;">
    Email
  </td>
  <td style="padding:10px 0;">
    ${contactEmail}
  </td>
</tr>

<tr>
  <td style="padding:10px 0;font-weight:600;">
    Subject
  </td>
  <td style="padding:10px 0;">
    ${subject}
  </td>
</tr>

<tr>
  <td style="padding:10px 0;font-weight:600;">
    Received
  </td>
  <td style="padding:10px 0;">
    ${new Date().toLocaleString()}
  </td>
</tr>

</table>

<div
  style="
    margin-top:30px;
    margin-bottom:12px;
    font-size:16px;
    font-weight:600;
    color:#111827;
  "
>
Message
</div>

<div
  style="
    background:#f8fafc;
    border:1px solid #e2e8f0;
    border-radius:8px;
    padding:18px;
    line-height:1.7;
    white-space:pre-wrap;
    color:#334155;
  "
>
${message}
</div>

<div
  style="
    margin-top:30px;
    padding-top:16px;
    border-top:1px solid #e5e7eb;
    font-size:12px;
    color:#94a3b8;
  "
>
This notification was generated automatically by Korexbase.
</div>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>`;
};

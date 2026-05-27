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
            max-width: 520px;
            background: #FFFFFF;
            border-radius: 22px;
            padding: 42px 34px;
            box-shadow: 0 6px 28px rgba(0,0,0,0.08);
          "
        >

          <!-- SUCCESS ICON -->
          <tr>
            <td align="center">

              <div
                style="
                  width: 72px;
                  height: 72px;
                  border-radius: 999px;
                  background: #EEF2FF;
                  text-align: center;
                  line-height: 72px;
                  font-size: 34px;
                  margin: 0 auto;
                "
              >
                <span
                  style="
                    position: relative;
                    top: 2px;
                  "
                >
                  🚀
                </span>
              </div>

            </td>
          </tr>

          <!-- BRAND -->
          <tr>
            <td
              align="center"
              style="
                font-size: 36px;
                font-weight: bold;
                color: #4F46E5;
                padding-top: 22px;
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
                font-size: 32px;
                font-weight: bold;
                color: #0F172A;
                padding-top: 18px;
                line-height: 42px;
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
                color: #10B981;
                font-size: 14px;
                font-weight: bold;
                padding-top: 12px;
              "
            >
              ✅ Job completed successfully
            </td>
          </tr>

          <!-- DESCRIPTION -->
          <tr>
            <td
              align="center"
              style="
                color: #64748B;
                font-size: 16px;
                line-height: 30px;
                padding-top: 28px;
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
            <td style="padding-top: 40px;">

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  background: #F8FAFC;
                  border-radius: 20px;
                  padding: 34px;
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
                        font-size: 58px;
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
            <td style="padding: 32px 0 22px 0;">

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

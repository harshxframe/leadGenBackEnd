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
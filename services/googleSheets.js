const { google } = require("googleapis");

const requiredEnv = ["CLIENT_ID", "CLIENT_SECRET", "REDIRECT_URI", "REFRESH_TOKEN", "SHEET_ID"];

const assertEnv = () => {
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing Google Sheets environment variables: ${missing.join(", ")}`);
  }
};

const createOAuthClient = () => {
  assertEnv();

  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });

  return oauth2Client;
};

const appendSubmission = async ({ name, email, phone, message, timestamp }) => {
  const auth = createOAuthClient();
  const sheets = google.sheets({ version: "v4", auth });
  const sheetName = process.env.SHEET_NAME || "Sheet1";

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SHEET_ID,
    range: `${sheetName}!A:E`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [[name, email, phone, message, timestamp]],
    },
  });
};

module.exports = {
  appendSubmission,
};


// const { google } = require("googleapis");

// const oauth2Client = new google.auth.OAuth2(
//   "YOUR_CLIENT_ID",
//   "YOUR_CLIENT_SECRET",
//   "http://localhost:3000"
// );

// const url = oauth2Client.generateAuthUrl({
//   access_type: "offline",
//   scope: [
//     "https://www.googleapis.com/auth/spreadsheets",
//     "https://www.googleapis.com/auth/gmail.send"
//   ]
// });

// console.log("Authorize this URL:", url);
require("dotenv").config();
const { google } = require("googleapis");
const readline = require("readline");

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/gmail.send",
];

const url = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
  prompt: "consent", // 🔥 VERY IMPORTANT
});

console.log("Authorize this URL:\n", url);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("\nPaste the code here: ", async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);

    console.log("\n✅ REFRESH TOKEN:\n");
    console.log(tokens.refresh_token);

  } catch (err) {
    console.error("Error retrieving token:", err);
  }
  rl.close();
});
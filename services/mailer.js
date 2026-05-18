const { google } = require("googleapis");
const nodemailer = require("nodemailer");

const requiredEnv = [
  "CLIENT_ID",
  "CLIENT_SECRET",
  "REDIRECT_URI",
  "REFRESH_TOKEN",
  "GMAIL_USER",
  "ADMIN_EMAIL",
];

const assertEnv = () => {
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing mailer environment variables: ${missing.join(", ")}`);
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

const sendAdminNotification = async ({ name, email, phone, message, timestamp }) => {
  const oauth2Client = createOAuthClient();
  const { token: accessToken } = await oauth2Client.getAccessToken();

  if (!accessToken) {
    throw new Error("Unable to refresh Gmail access token.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.GMAIL_USER,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken,
    },
  });

  await transporter.sendMail({
    from: `"Hakayaa Website" <${process.env.GMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    replyTo: email,
    subject: `New Hakayaa contact form submission from ${name}`,
    text: [
      "New Hakayaa contact form submission",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "Not provided"}`,
      `Timestamp: ${timestamp}`,
      "",
      "Message:",
      message,
    ].join("\n"),
    html: `
      <h2>New Hakayaa contact form submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone || "Not provided")}</p>
      <p><strong>Timestamp:</strong> ${escapeHtml(timestamp)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
    `,
  });
};

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

module.exports = {
  sendAdminNotification,
};

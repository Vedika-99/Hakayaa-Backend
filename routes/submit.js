const express = require("express");
const rateLimit = require("express-rate-limit");
const { appendSubmission } = require("../services/googleSheets");
const { sendAdminNotification } = require("../services/mailer");
const { validateSubmission } = require("../utils/validate");

const router = express.Router();

const getConfigurationErrorMessage = (error) => {
  const message = error && error.message ? error.message : "";
  const match = message.match(/^Missing (?:Google Sheets|mailer) environment variables: (.+)$/);

  if (!match) {
    return null;
  }

  return `Server configuration is missing: ${match[1]}.`;
};

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many submissions. Please wait and try again." },
});

router.post("/", submitLimiter, async (req, res, next) => {
  try {
    console.log("[submit] Incoming body keys:", Object.keys(req.body || {}));

    const { isValid, data, errors, isSpam } = validateSubmission(req.body);

    if (isSpam) {
      console.warn("[submit] Spam submission blocked.");
      return res.status(400).json({ success: false, message: "Invalid submission." });
    }

    if (!isValid) {
      console.warn("[submit] Validation failed:", errors);
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields correctly.",
        errors,
      });
    }

    const timestamp = new Date().toISOString();
    const submission = { ...data, timestamp };

    await appendSubmission(submission);
    await sendAdminNotification(submission);

    console.log(`[submit] Stored and emailed submission from ${data.email}`);
    return res.status(201).json({
      success: true,
      message: "Thanks. Your message has been sent successfully.",
    });
  } catch (error) {
    console.error("[submit] Failed to process submission:", error);

    const configurationMessage = getConfigurationErrorMessage(error);
    if (configurationMessage) {
      return res.status(500).json({
        success: false,
        code: "MISSING_SERVER_CONFIG",
        message: configurationMessage,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to send your message right now. Please try again later.",
    });
  }
});

module.exports = router;

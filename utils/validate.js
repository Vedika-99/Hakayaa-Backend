const validator = require("validator");

const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 20;
const MAX_MESSAGE_LENGTH = 5000;

const sanitizeText = (value, maxLength) => {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
};

const sanitizeMessage = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim()
    .slice(0, MAX_MESSAGE_LENGTH);
};

const validateSubmission = (body = {}) => {
  const errors = {};

  // Optional honeypot support. If a bot submits these hidden fields, block it.
  const honeypot = sanitizeText(body.website || body.companyUrl || body.url || "", 200);
  if (honeypot) {
    return { isValid: false, isSpam: true, errors: { spam: "Invalid submission." } };
  }

  const name = sanitizeText(body.name, MAX_NAME_LENGTH);
  const rawEmail = sanitizeText(body.email, MAX_EMAIL_LENGTH).toLowerCase();
  const email = validator.normalizeEmail(rawEmail, { gmail_remove_dots: false }) || rawEmail;
  const phone = sanitizeText(body.phone || body.mobile || "", MAX_PHONE_LENGTH).replace(/\D/g, "");
  const message = sanitizeMessage(body.message);

  if (!name) {
    errors.name = "Name is required.";
  }

  if (!email || !validator.isEmail(email)) {
    errors.email = "A valid email is required.";
  }

  if (!message) {
    errors.message = "Message is required.";
  }

  if (message && message.length < 10) {
    errors.message = "Message must be at least 10 characters.";
  }

  if (phone && !/^\d{10,15}$/.test(phone)) {
    errors.phone = "Phone number must be between 10 and 15 digits.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    isSpam: false,
    errors,
    data: { name, email, phone, message },
  };
};

module.exports = {
  validateSubmission,
};

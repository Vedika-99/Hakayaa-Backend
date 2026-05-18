// Frontend integration example for a static Hakayaa page.
// Use your Render backend URL in production, for example:
// const API_URL = "https://hakayaa-backend.onrender.com/submit";

const API_URL = "/submit";
const form = document.querySelector("[data-contact-form]");
const statusNode = document.querySelector("[data-form-status]");
const submitButton = document.querySelector("[data-submit-button]");

const setStatus = (message, type = "") => {
  if (!statusNode) return;
  statusNode.textContent = message;
  statusNode.className = `contact-form-status ${type}`.trim();
};

if (form) {
  const originalButtonMarkup = submitButton ? submitButton.innerHTML : "Send Message";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      phone: String(data.get("phone") || data.get("mobile") || "").replace(/\D/g, ""),
      message: String(data.get("message") || "").trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      setStatus("Please fill in your name, email, and message.", "is-error");
      return;
    }

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = "<span>Sending...</span>";
      }
      setStatus("Sending your message...");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || "Unable to submit right now.");
      }

      form.reset();
      setStatus("Thanks. Your message has been sent successfully.", "is-success");
    } catch (error) {
      console.error("[contact-form] Submission failed:", error);
      setStatus(error.message || "Something went wrong. Please try again.", "is-error");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonMarkup;
      }
    }
  });
}

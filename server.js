require("dotenv").config();

const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const submitRouter = require("./routes/submit");

const app = express();
const PORT = process.env.PORT || 3000;

// Render sits behind a proxy. This keeps rate limiting/IP detection accurate.
app.set("trust proxy", 1);

const normalizeOrigin = (origin) => origin.replace(/\/$/, "");

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .map(normalizeOrigin)
  .filter(Boolean);

const localhostOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5500",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5500",
  "http://localhost:58685",
  "http://localhost:64931",
  "http://localhost:53199",
  "http://localhost:52008",
];

const corsOptions = {
  origin(origin, callback) {
    // No Origin header usually means curl, Postman, or Render health checks.
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = normalizeOrigin(origin);
    if (localhostOrigins.includes(normalizedOrigin) || allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.warn(`[cors] Blocked origin: ${origin}. Allowed origins: ${allowedOrigins.join(", ") || "none configured"}`);
    return callback(new Error("CORS origin not allowed"));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  optionsSuccessStatus: 204,
};

app.use(helmet());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "20kb" }));

app.use((req, res, next) => {
  console.log(`[request] ${req.method} ${req.path} origin=${req.headers.origin || "none"}`);
  next();
});

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests. Please try again later." },
  })
);

app.get("/", (req, res) => {
  res.json({ success: true, message: "Hakayaa backend is running." });
});

app.get("/health", (req, res) => {
  res.json({ success: true, status: "ok" });
});

app.use("/submit", submitRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

app.use((error, req, res, next) => {
  console.error("[server] Unhandled error:", error);

  if (error.message === "CORS origin not allowed") {
    return res.status(403).json({
      success: false,
      message: "This website origin is not allowed to submit the form.",
    });
  }

  res.status(error.status || 500).json({
    success: false,
    message: error.publicMessage || "Something went wrong. Please try again later.",
  });
});

app.listen(PORT, () => {
  console.log(`[server] Hakayaa backend listening on port ${PORT}`);
});

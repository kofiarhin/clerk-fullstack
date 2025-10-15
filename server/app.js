// server/app.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { clerkMiddleware, requireAuth } = require("@clerk/express"); // ✅

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

// ✅ Initialize Clerk middleware BEFORE routes
app.use(clerkMiddleware());

const mongoUri = process.env.MONGO_URI;

if (mongoUri) {
  mongoose
    .connect(mongoUri)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err.message));
} else {
  console.warn("MONGO_URI not provided. MongoDB connection skipped.");
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// ✅ Strict auth (replacement for ClerkExpressRequireAuth)
app.get("/api/me", requireAuth(), (req, res) => {
  res.json({
    userId: req.auth.userId,
    sessionId: req.auth.sessionId,
  });
});

app.post("/api/items", requireAuth(), (req, res) => {
  res.status(201).json({
    message: "Item created",
    userId: req.auth.userId,
    payload: req.body || null,
  });
});

module.exports = app;

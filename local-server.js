"use strict";

// Express server used for Docker and local development.
// On Vercel, /public is served as static files and /api/contact runs as a serverless function.

const path = require("path");
const express = require("express");
const contactHandler = require("./lib/contact-handler");
const { ensureSchema } = require("./lib/db");

const app = express();
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");
app.use(express.json({ limit: "20kb" }));

app.all("/api/contact", contactHandler);
app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"], maxAge: "1h" }));
app.use((_req, res) => res.status(404).sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, async () => {
  console.log(`Portfolio running on http://localhost:${PORT}`);
  try {
    await ensureSchema();
    console.log("Database ready");
  } catch (err) {
    console.warn("Database not reachable yet:", err.message);
  }
});

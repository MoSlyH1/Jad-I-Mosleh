"use strict";

const { saveMessage } = require("./db");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Works as both a Vercel serverless function and an Express route handler.
module.exports = async function contactHandler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  let body = req.body || {};
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  // Honeypot: real visitors never fill this hidden field.
  if (body.company) return res.status(200).json({ ok: true });

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const message = String(body.message || "").trim();

  if (!name || name.length > 120) return res.status(400).json({ ok: false, error: "Please enter your name." });
  if (!EMAIL_RE.test(email) || email.length > 200) return res.status(400).json({ ok: false, error: "Please enter a valid email." });
  if (!message || message.length > 4000) return res.status(400).json({ ok: false, error: "Please enter a message (up to 4000 characters)." });

  try {
    const saved = await saveMessage({ name, email, message });
    return res.status(201).json({ ok: true, id: saved.id });
  } catch (err) {
    console.error("contact: failed to save message", err);
    return res.status(500).json({ ok: false, error: "Could not send right now. Please email me directly." });
  }
};

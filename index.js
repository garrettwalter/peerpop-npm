"use strict";

const crypto = require("crypto");
const https = require("https");

const API_BASE = "us-central1-peer-pops-io.cloudfunctions.net";

/**
 * List events from the PeerPop API (past or upcoming).
 *
 * @param {"past"|"upcoming"} type - "past" or "upcoming".
 * @param {string} userId - User ID (_id).
 * @param {string} apiKey - Your PeerPop API key.
 * @returns {Promise<object>} API response (parsed JSON).
 */
function listEvents(type, userId, apiKey) {
  if (type !== "past" && type !== "upcoming") {
    return Promise.reject(new Error('type must be "past" or "upcoming"'));
  }
  const path = `/v1/events/${type}`;
  const body = JSON.stringify({ _id: userId, key: apiKey });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: API_BASE,
        path,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const data = Buffer.concat(chunks).toString("utf8");
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error("Invalid JSON response: " + data.slice(0, 100)));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

const TOLERANCE_SEC = 300;

/**
 * Verify PeerPop webhook signature and return the payload.
 * Use the raw request body (exactly as received) and the X-Webhook-Signature header.
 *
 * @param {string} rawBody - Raw request body string.
 * @param {string} signatureHeader - Value of the X-Webhook-Signature header.
 * @param {string} secret - Your webhook secret.
 * @returns {object} Parsed payload (phone, email, action, amount, event, metadata).
 * @throws {Error} If signature is missing when required, invalid, or expired.
 */
function verify(rawBody, signatureHeader, secret) {
  const payload = JSON.parse(rawBody);

  // No secret configured → accept plain body (host didn't set a secret)
  if (!secret) return payload;
  // Secret set but no signature → reject (expect signed webhooks)
  if (!signatureHeader) {
    const err = new Error("Missing webhook signature");
    err.code = "PEERPOP_WEBHOOK_INVALID";
    throw err;
  }

  const parts = signatureHeader.split(",").reduce((acc, p) => {
    const [k, v] = p.split("=");
    if (k && v) acc[k.trim()] = v.trim();
    return acc;
  }, {});

  const t = parseInt(parts.t, 10);
  const v1 = parts.v1;
  if (!Number.isFinite(t) || !v1) {
    const err = new Error("Invalid webhook signature");
    err.code = "PEERPOP_WEBHOOK_INVALID";
    throw err;
  }

  if (Math.abs(Date.now() / 1000 - t) > TOLERANCE_SEC) {
    const err = new Error("Webhook signature expired");
    err.code = "PEERPOP_WEBHOOK_EXPIRED";
    throw err;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${t}.${rawBody}`)
    .digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(v1, "hex");
  if (expectedBuf.length !== actualBuf.length) {
    const err = new Error("Invalid webhook signature");
    err.code = "PEERPOP_WEBHOOK_INVALID";
    throw err;
  }
  if (!crypto.timingSafeEqual(actualBuf, expectedBuf)) {
    const err = new Error("Invalid webhook signature");
    err.code = "PEERPOP_WEBHOOK_INVALID";
    throw err;
  }

  return payload;
}

/**
 * Express middleware: verifies X-Webhook-Signature and sets req.webhookPayload.
 * Use express.raw({ type: "application/json" }) for the webhook route so req.body is the raw Buffer.
 *
 * @param {string} secret - Your webhook secret.
 * @returns {function} Express middleware.
 */
function middleware(secret) {
  return (req, res, next) => {
    const rawBody = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : typeof req.body === "string"
        ? req.body
        : "";
    const sig = req.headers["x-webhook-signature"];
    try {
      req.webhookPayload = verify(rawBody, sig, secret);
      next();
    } catch (err) {
      res.status(400).send(err.message || "Webhook verification failed");
    }
  };
}

module.exports = {
  events: { list: listEvents },
  webhook: { verify, middleware },
};

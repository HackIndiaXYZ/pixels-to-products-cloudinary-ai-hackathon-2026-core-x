const crypto = require('crypto');
const express = require('express');

const router = express.Router();
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 60;
const recentRequestsByIp = new Map();

function timingSafeEqualHex(a, b) {
  const bufA = Buffer.from(a || '', 'hex');
  const bufB = Buffer.from(b || '', 'hex');

  if (bufA.length !== bufB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

function verifyCloudinaryWebhook(req) {
  const webhookSecret = process.env.CLOUDINARY_WEBHOOK_SECRET;
  const providedSignature = req.get('X-Cld-Signature') || req.get('x-cld-signature');
  const providedTimestamp = req.get('X-Cld-Timestamp') || req.get('x-cld-timestamp');
  const timestampSeconds = Number(providedTimestamp);

  if (!webhookSecret || !providedSignature || !providedTimestamp || !req.rawBody || Number.isNaN(timestampSeconds)) {
    return false;
  }

  if (Math.abs(Math.floor(Date.now() / 1000) - timestampSeconds) > 300) {
    return false;
  }

  const signedPayload = `${providedTimestamp}.${req.rawBody}`;
  const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(signedPayload).digest('hex');

  return timingSafeEqualHex(providedSignature, expectedSignature);
}

function rateLimitWebhook(req, res, next) {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const bucket = recentRequestsByIp.get(ip);

  if (!bucket || now - bucket.windowStart > WINDOW_MS) {
    recentRequestsByIp.set(ip, { count: 1, windowStart: now });
    return next();
  }

  if (bucket.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  bucket.count += 1;
  return next();
}

router.post('/cloudinary-webhook', rateLimitWebhook, (req, res) => {
  if (!verifyCloudinaryWebhook(req)) {
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }

  const eventType = req.body?.notification_type || req.body?.event || 'unknown';
  const publicId = req.body?.public_id || req.body?.asset_id || 'n/a';

  // Replace with persistence / message queue publish in production.
  console.log('[cloudinary-webhook]', JSON.stringify({ eventType, publicId }));

  return res.status(200).json({ received: true });
});

module.exports = router;

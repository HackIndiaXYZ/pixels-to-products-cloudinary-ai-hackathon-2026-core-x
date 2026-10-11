const crypto = require('crypto');
const express = require('express');

const router = express.Router();

function timingSafeEqualHex(a, b) {
  const bufA = Buffer.from(a || '', 'hex');
  const bufB = Buffer.from(b || '', 'hex');

  if (bufA.length !== bufB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

function verifyCloudinaryWebhook(req) {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const providedSignature = req.get('X-Cld-Signature') || req.get('x-cld-signature');
  const providedTimestamp = req.get('X-Cld-Timestamp') || req.get('x-cld-timestamp');

  if (!apiSecret || !providedSignature || !providedTimestamp || !req.rawBody) {
    return false;
  }

  const signedPayload = `${providedTimestamp}${req.rawBody}${apiSecret}`;
  const expectedSha1 = crypto.createHash('sha1').update(signedPayload).digest('hex');
  const expectedSha256 = crypto.createHash('sha256').update(signedPayload).digest('hex');

  return timingSafeEqualHex(providedSignature, expectedSha1) || timingSafeEqualHex(providedSignature, expectedSha256);
}

router.post('/cloudinary-webhook', (req, res) => {
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

const crypto = require('crypto');
const express = require('express');

const router = express.Router();

function enforceAuth(req, res, next) {
  const expectedToken = process.env.INTERNAL_API_TOKEN;

  if (!expectedToken) {
    return next();
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;

  if (!token || token !== expectedToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return next();
}

function normalizeSignableParams(payload) {
  const timestamp = Number(payload.timestamp) || Math.floor(Date.now() / 1000);

  const signable = {
    folder: payload.folder || 'resqstream-ai/uploads',
    timestamp,
    upload_preset: payload.uploadPreset || payload.upload_preset || undefined,
    public_id: payload.publicId || payload.public_id || undefined,
    context: payload.context || undefined,
    tags: Array.isArray(payload.tags) ? payload.tags.join(',') : payload.tags || undefined,
    source: payload.source || undefined,
    resource_type: payload.resourceType || payload.resource_type || undefined
  };

  return Object.fromEntries(Object.entries(signable).filter(([, value]) => value !== undefined && value !== null && value !== ''));
}

function createSha256Signature(params, apiSecret) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return crypto.createHash('sha256').update(`${toSign}${apiSecret}`).digest('hex');
}

router.post('/sign-upload', enforceAuth, (req, res) => {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  if (!apiSecret || !apiKey || !cloudName) {
    return res.status(500).json({ error: 'Cloudinary configuration is incomplete.' });
  }

  const signableParams = normalizeSignableParams(req.body || {});
  const signature = createSha256Signature(signableParams, apiSecret);

  return res.json({
    cloudName,
    apiKey,
    signature,
    signatureAlgorithm: 'sha256',
    paramsToSign: signableParams
  });
});

module.exports = router;

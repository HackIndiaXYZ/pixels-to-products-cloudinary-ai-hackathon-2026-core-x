require('dotenv').config();
const express = require('express');
const cors = require('cors');

require('./config/cloudinary');

const uploadSignRoutes = require('./routes/uploadSign');
const webhookRoutes = require('./routes/webhooks');

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf.toString('utf8');
    }
  })
);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', uploadSignRoutes);
app.use('/api', webhookRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`ResQStream backend listening on port ${port}`);
});

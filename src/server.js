require('dotenv').config();
const express = require('express');
const learningRoutes = require('./routes/learning');

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/learning', learningRoutes);

app.use((err, _req, res, _next) => {
  return res.status(500).json({ message: 'Unhandled error', detail: err.message });
});

const port = Number(process.env.PORT || 3000);

if (require.main === module) {
  app.listen(port, () => {
    process.stdout.write(`Learning service listening on ${port}\n`);
  });
}

module.exports = app;

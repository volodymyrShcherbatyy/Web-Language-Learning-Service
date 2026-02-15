require('dotenv').config();
const express = require('express');
const lessonRoutes = require('./routes/lessonRoutes');

const app = express();

app.use(express.json());
app.use('/api', lessonRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

const port = Number(process.env.PORT || 3000);
if (require.main === module) {
  app.listen(port, () => {
    process.stdout.write(`Server running on port ${port}\n`);
  });
}

module.exports = app;

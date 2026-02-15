const express = require('express');
const config = require('./config/env');
const errorHandler = require('./middlewares/errorHandler');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const conceptRoutes = require('./routes/conceptRoutes');
const adminRoutes = require('./routes/adminRoutes');
const localizationRoutes = require('./routes/localizationRoutes');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/concepts', conceptRoutes);
app.use('/admin', adminRoutes);
app.use('/localization', localizationRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

app.use(errorHandler);

app.listen(config.port, () => {
  process.stdout.write(`Server running on port ${config.port}\n`);
});

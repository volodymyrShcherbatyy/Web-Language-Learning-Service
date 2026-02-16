const express = require('express');
const config = require('./config/env');
const errorHandler = require('./middlewares/errorHandler');

const lessonRoutes = require('./src/routes/lessonRoutes');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const conceptRoutes = require('./routes/conceptRoutes');
const adminRoutes = require('./routes/adminRoutes');
const localizationRoutes = require('./routes/localizationRoutes');
const languageRoutes = require('./routes/languageRoutes');

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/lesson', lessonRoutes);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/concepts', conceptRoutes);
app.use('/admin', adminRoutes);
app.use('/localization', localizationRoutes);
app.use('/languages', languageRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

app.use(errorHandler);

app.listen(config.port, () => {
  process.stdout.write(`Server running on port ${config.port}\n`);
});

process.on('uncaughtException', (err) => {
  process.stderr.write(`[CRASH] uncaughtException: ${err.stack || err.message}\n`);
});

process.on('unhandledRejection', (reason) => {
  process.stderr.write(`[CRASH] unhandledRejection: ${reason instanceof Error ? reason.stack : reason}\n`);
});

const express = require('express');
const errorHandler = require('../../middlewares/errorHandler');

const authRoutes = require('../../routes/authRoutes');
const profileRoutes = require('../../routes/profileRoutes');
const adminRoutes = require('../../routes/adminRoutes');
const localizationRoutes = require('../../routes/localizationRoutes');
const lessonRoutes = require('../../src/routes/lessonRoutes');

function createTestApp() {
  const app = express();
  app.use(express.json());

  app.use('/auth', authRoutes);
  app.use('/profile', profileRoutes);
  app.use('/admin', adminRoutes);
  app.use('/localization', localizationRoutes);
  app.use('/api', lessonRoutes);

  app.use(errorHandler);

  return app;
}

module.exports = createTestApp;

const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { getProfile, updateLanguages } = require('../controllers/profileController');

const router = express.Router();

router.get('/', authMiddleware, getProfile);
router.put('/languages', authMiddleware, updateLanguages);

module.exports = router;

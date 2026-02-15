const express = require('express');
const { getLanguages } = require('../controllers/languageController');

const router = express.Router();

router.get('/', getLanguages);

module.exports = router;

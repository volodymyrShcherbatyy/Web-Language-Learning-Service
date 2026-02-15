const express = require('express');
const { getLocalization } = require('../controllers/localizationController');

const router = express.Router();

router.get('/', getLocalization);

module.exports = router;

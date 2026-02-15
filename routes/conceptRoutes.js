const express = require('express');
const { getAllConcepts, getConceptById } = require('../controllers/conceptController');

const router = express.Router();

router.get('/', getAllConcepts);
router.get('/:id', getConceptById);

module.exports = router;

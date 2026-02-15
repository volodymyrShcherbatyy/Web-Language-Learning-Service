const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { createConcept, addTranslation, uploadMedia } = require('../controllers/adminController');

const router = express.Router();

router.use(authMiddleware, roleMiddleware('admin'));
router.post('/concepts', createConcept);
router.post('/translations', addTranslation);
router.post('/media', uploadMedia);

module.exports = router;

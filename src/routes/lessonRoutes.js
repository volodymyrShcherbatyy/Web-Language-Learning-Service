const express = require('express');
const { requireAuth } = require('../middleware/auth');
const lessonController = require('../controllers/lessonController');

const router = express.Router();

router.post('/start', requireAuth, lessonController.startLesson);
router.get('/next', requireAuth, lessonController.getNextExercise);
router.post('/answer', requireAuth, lessonController.submitAnswer);
router.get('/summary', requireAuth, lessonController.getLessonSummary);

module.exports = router;

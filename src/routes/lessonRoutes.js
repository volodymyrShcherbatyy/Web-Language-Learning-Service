const express = require('express');
const { requireAuth } = require('../middleware/auth');
const lessonController = require('../controllers/lessonController');

const router = express.Router();

router.post('/lesson/start', requireAuth, lessonController.startLesson);
router.get('/lesson/next', requireAuth, lessonController.getNextExercise);
router.post('/lesson/answer', requireAuth, lessonController.submitAnswer);
router.get('/lesson/summary', requireAuth, lessonController.getLessonSummary);

module.exports = router;

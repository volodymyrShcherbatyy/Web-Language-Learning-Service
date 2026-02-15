const lessonService = require('../services/lessonService');

function getLanguageContext(req) {
  return {
    nativeLanguageCode: req.query.native_lang || req.body.native_lang || 'en',
    targetLanguageCode: req.query.target_lang || req.body.target_lang || 'es'
  };
}

async function startLesson(req, res, next) {
  try {
    const session = await lessonService.startLesson({
      userId: req.user.id,
      totalExercises: req.body.total_exercises,
      maxNewWords: req.body.max_new_words
    });
    res.status(201).json({ session });
  } catch (error) {
    next(error);
  }
}

async function getNextExercise(req, res, next) {
  try {
    const { nativeLanguageCode, targetLanguageCode } = getLanguageContext(req);
    const payload = await lessonService.getNextExercise({
      userId: req.user.id,
      sessionId: Number(req.query.session_id),
      nativeLanguageCode,
      targetLanguageCode
    });
    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
}

async function submitAnswer(req, res, next) {
  try {
    const { nativeLanguageCode, targetLanguageCode } = getLanguageContext(req);
    const payload = await lessonService.submitAnswer({
      userId: req.user.id,
      sessionId: Number(req.body.session_id),
      exerciseId: Number(req.body.exercise_id),
      answer: req.body.answer,
      nativeLanguageCode,
      targetLanguageCode
    });
    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
}

async function getLessonSummary(req, res, next) {
  try {
    const payload = await lessonService.getLessonSummary({
      userId: req.user.id,
      sessionId: Number(req.query.session_id)
    });
    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  startLesson,
  getNextExercise,
  submitAnswer,
  getLessonSummary
};

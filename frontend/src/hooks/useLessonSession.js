import { useCallback, useEffect, useMemo, useState } from 'react';
import { getNextExercise, startLessonSession, submitLessonAnswer } from '../services/lessonApi';

const INITIAL_FEEDBACK = {
  isCorrect: null,
  correctAnswerId: null,
};

const normalizeExercise = (exercise, totalFromSession = null) => {
  if (!exercise) {
    return null;
  }

  const current = exercise.progress?.current ?? null;
  const total = exercise.progress?.total ?? totalFromSession ?? null;

  return {
    exercise_id: exercise.exercise_id,
    type: exercise.type,
    prompt: exercise.prompt,
    media: exercise.media,
    options: Array.isArray(exercise.options) ? exercise.options : [],
    progress: {
      current,
      total,
    },
  };
};

export const useLessonSession = () => {
  const [sessionId, setSessionId] = useState(null);
  const [totalExercises, setTotalExercises] = useState(0);
  const [exercise, setExercise] = useState(null);
  const [nextExerciseCache, setNextExerciseCache] = useState(undefined);
  const [selectedAnswerId, setSelectedAnswerId] = useState(null);
  const [feedback, setFeedback] = useState(INITIAL_FEEDBACK);
  const [answerHistory, setAnswerHistory] = useState([]);
  const [isLoadingExercise, setIsLoadingExercise] = useState(true);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState('');

  const loadNextExercise = useCallback(
    async ({ preferCache = false } = {}) => {
      setIsLoadingExercise(true);
      setError('');

      try {
        let nextExercise = null;

        if (preferCache && nextExerciseCache !== undefined) {
          nextExercise = nextExerciseCache;
        } else {
          nextExercise = await getNextExercise();
        }

        setNextExerciseCache(undefined);

        if (!nextExercise) {
          setExercise(null);
          setIsCompleted(true);
          return;
        }

        const normalizedExercise = normalizeExercise(nextExercise, totalExercises || null);
        setExercise(normalizedExercise);
        setFeedback(INITIAL_FEEDBACK);
        setSelectedAnswerId(null);
      } catch (requestError) {
        setError(requestError.message || 'Unable to load exercise.');
      } finally {
        setIsLoadingExercise(false);
      }
    },
    [nextExerciseCache, totalExercises]
  );

  const preloadNextExercise = useCallback(async () => {
    try {
      const nextExercise = await getNextExercise();
      setNextExerciseCache(normalizeExercise(nextExercise, totalExercises || null));
    } catch {
      setNextExerciseCache(undefined);
    }
  }, [totalExercises]);

  const startSession = useCallback(async () => {
    setIsLoadingExercise(true);
    setError('');

    try {
      const session = await startLessonSession();
      const nextSessionId = session.session_id;
      const nextTotal = Number(session.total_exercises ?? 0);

      if (!nextSessionId) {
        throw new Error('Unable to start session.');
      }

      setSessionId(nextSessionId);
      setTotalExercises(nextTotal);
      setIsCompleted(false);
      setAnswerHistory([]);

      const firstExercise = await getNextExercise();

      if (!firstExercise) {
        setExercise(null);
        setIsCompleted(true);
        return;
      }

      setExercise(normalizeExercise(firstExercise, nextTotal));
      setFeedback(INITIAL_FEEDBACK);
      setSelectedAnswerId(null);
    } catch (requestError) {
      setError(requestError.message || 'Unable to start lesson session.');
    } finally {
      setIsLoadingExercise(false);
    }
  }, []);

  const submitAnswer = useCallback(async () => {
    if (!sessionId || !exercise?.exercise_id || selectedAnswerId === null || isSubmittingAnswer) {
      return;
    }

    setIsSubmittingAnswer(true);
    setError('');

    try {
      const result = await submitLessonAnswer({
        session_id: sessionId,
        exercise_id: exercise.exercise_id,
        answer_id: selectedAnswerId,
      });

      const isCorrect = Boolean(result.correct);
      const correctAnswerId = result.correct_answer_id;

      setFeedback({
        isCorrect,
        correctAnswerId,
      });

      setAnswerHistory((current) => [
        ...current,
        {
          exerciseId: exercise.exercise_id,
          answerId: selectedAnswerId,
          isCorrect,
        },
      ]);

      preloadNextExercise();
    } catch (requestError) {
      setError(requestError.message || 'Unable to submit answer.');
    } finally {
      setIsSubmittingAnswer(false);
    }
  }, [exercise?.exercise_id, isSubmittingAnswer, preloadNextExercise, selectedAnswerId, sessionId]);

  const goToNextExercise = useCallback(async () => {
    if (isSubmittingAnswer || feedback.isCorrect === null) {
      return;
    }

    await loadNextExercise({ preferCache: true });
  }, [feedback.isCorrect, isSubmittingAnswer, loadNextExercise]);

  useEffect(() => {
    startSession();
  }, [startSession]);

  const progress = useMemo(() => {
    const current = exercise?.progress?.current ?? answerHistory.length + (exercise ? 1 : 0);
    const total = exercise?.progress?.total ?? totalExercises;

    return {
      current,
      total,
    };
  }, [answerHistory.length, exercise, totalExercises]);

  return {
    sessionId,
    exercise,
    progress,
    selectedAnswerId,
    setSelectedAnswerId,
    feedback,
    answerHistory,
    isLoadingExercise,
    isSubmittingAnswer,
    isCompleted,
    error,
    retryStartSession: startSession,
    submitAnswer,
    goToNextExercise,
  };
};

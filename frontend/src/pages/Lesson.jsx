import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExerciseCard from '../components/ExerciseCard';
import FeedbackBanner from '../components/FeedbackBanner';
import ProgressBar from '../components/ProgressBar';
import { useLessonSession } from '../hooks/useLessonSession';

const Lesson = () => {
  const navigate = useNavigate();
  const {
    exercise,
    progress,
    selectedAnswerId,
    setSelectedAnswerId,
    feedback,
    isLoadingExercise,
    isSubmittingAnswer,
    isCompleted,
    error,
    retryStartSession,
    submitAnswer,
    goToNextExercise,
  } = useLessonSession();

  useEffect(() => {
    if (isCompleted) {
      navigate('/lesson/summary', { replace: true });
    }
  }, [isCompleted, navigate]);

  const showSubmit = feedback.isCorrect === null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white px-4 py-6 md:py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <ProgressBar current={progress.current} total={progress.total} />

        {error ? (
          <div className="rounded-xl border border-red-300 bg-red-100 px-4 py-3 text-sm font-medium text-red-900" role="alert">
            <div>{error}</div>
            <button
              type="button"
              className="mt-2 rounded-lg border border-red-400 px-3 py-1 text-xs font-semibold transition hover:bg-red-200"
              onClick={retryStartSession}
            >
              Retry session
            </button>
          </div>
        ) : null}

        {isLoadingExercise ? (
          <section className="w-full rounded-2xl bg-white p-6 shadow-xl md:p-8" aria-busy="true">
            <div className="mx-auto mb-5 h-8 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-56 w-full animate-pulse rounded-xl bg-gray-200" />
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-xl bg-gray-200" />
              ))}
            </div>
          </section>
        ) : (
          <ExerciseCard
            exercise={exercise}
            selectedAnswerId={selectedAnswerId}
            onSelectAnswer={setSelectedAnswerId}
            feedback={feedback}
            isSubmitted={feedback.isCorrect !== null}
            isSubmitting={isSubmittingAnswer}
          />
        )}

        <FeedbackBanner feedback={feedback} />

        <div className="flex justify-end">
          {showSubmit ? (
            <button
              type="button"
              onClick={submitAnswer}
              disabled={!selectedAnswerId || isSubmittingAnswer || isLoadingExercise}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {isSubmittingAnswer ? 'Submitting...' : 'Check answer'}
            </button>
          ) : (
            <button
              type="button"
              onClick={goToNextExercise}
              disabled={isLoadingExercise}
              className="rounded-xl bg-gray-900 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </main>
  );
};

export default Lesson;

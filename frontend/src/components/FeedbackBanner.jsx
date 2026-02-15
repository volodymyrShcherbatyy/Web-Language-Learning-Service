const FeedbackBanner = ({ feedback }) => {
  if (feedback.isCorrect === null) {
    return null;
  }

  const className = feedback.isCorrect
    ? 'border-green-300 bg-green-100 text-green-900'
    : 'border-red-300 bg-red-100 text-red-900';

  return (
    <div className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold ${className}`} role="status" aria-live="polite">
      {feedback.isCorrect ? 'Correct!' : 'Wrong'}
    </div>
  );
};

export default FeedbackBanner;

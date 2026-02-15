const AnswerOption = ({
  option,
  isSelected,
  disabled,
  onSelect,
  isSubmitted,
  isCorrect,
  isWrong,
}) => {
  const stateClass = isSubmitted
    ? isCorrect
      ? 'border-green-500 bg-green-50 text-green-900'
      : isWrong
      ? 'border-red-500 bg-red-50 text-red-900'
      : 'border-gray-200 bg-white text-gray-900'
    : isSelected
    ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
    : 'border-gray-200 bg-white text-gray-900 hover:border-indigo-300 hover:bg-indigo-50';

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`w-full rounded-xl border-2 px-4 py-4 text-left text-base font-medium shadow-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-80 ${stateClass}`}
      aria-pressed={isSelected}
    >
      {option.text}
    </button>
  );
};

export default AnswerOption;

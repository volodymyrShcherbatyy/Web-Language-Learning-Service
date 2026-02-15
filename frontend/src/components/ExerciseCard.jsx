import AnswerOption from './AnswerOption';
import MediaDisplay from './MediaDisplay';

const ExerciseCard = ({
  exercise,
  selectedAnswerId,
  onSelectAnswer,
  isSubmitted,
  feedback,
  isSubmitting,
}) => {
  if (!exercise) {
    return null;
  }

  return (
    <section className="w-full rounded-2xl bg-white p-6 shadow-xl md:p-8">
      <h2 className="text-center text-2xl font-bold text-gray-900">{exercise.prompt}</h2>

      <div className="mt-5">
        <MediaDisplay media={exercise.media} prompt={exercise.prompt} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {exercise.options.map((option) => {
          const isSelected = selectedAnswerId === option.id;
          const isCorrect = isSubmitted && feedback.correctAnswerId === option.id;
          const isWrong = isSubmitted && isSelected && !feedback.isCorrect;

          return (
            <AnswerOption
              key={option.id}
              option={option}
              isSelected={isSelected}
              isCorrect={isCorrect}
              isWrong={isWrong}
              isSubmitted={isSubmitted}
              disabled={isSubmitted || isSubmitting}
              onSelect={() => onSelectAnswer(option.id)}
            />
          );
        })}
      </div>
    </section>
  );
};

export default ExerciseCard;

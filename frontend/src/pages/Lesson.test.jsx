import { fireEvent, render, screen } from '@testing-library/react';
import Lesson from './Lesson';

const hookState = {
  exercise: {
    exercise_id: 1,
    prompt: 'hola',
    options: [
      { id: 1, text: 'hello' },
      { id: 2, text: 'bye' }
    ],
    progress: { current: 1, total: 5 }
  },
  progress: { current: 1, total: 5 },
  selectedAnswerId: null,
  setSelectedAnswerId: jest.fn(),
  feedback: { isCorrect: null, correctAnswerId: null },
  isLoadingExercise: false,
  isSubmittingAnswer: false,
  isCompleted: false,
  error: '',
  retryStartSession: jest.fn(),
  submitAnswer: jest.fn(),
  goToNextExercise: jest.fn()
};

jest.mock('../hooks/useLessonSession', () => ({
  useLessonSession: () => hookState
}));

jest.mock('../hooks/useLocalization', () => () => ({ t: (key) => key }));

describe('Lesson player UI', () => {
  beforeEach(() => jest.clearAllMocks());

  test('renders exercise and submit button', () => {
    render(<Lesson />);
    expect(screen.getByText('lesson_session')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'check_answer' })).toBeInTheDocument();
  });

  test('disables submit until answer selected', () => {
    render(<Lesson />);
    expect(screen.getByRole('button', { name: 'check_answer' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'check_answer' }));
    expect(hookState.submitAnswer).not.toHaveBeenCalled();
  });
});

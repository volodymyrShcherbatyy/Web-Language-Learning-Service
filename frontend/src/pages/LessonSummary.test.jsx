import { render, screen, waitFor } from '@testing-library/react';
import LessonSummary from './LessonSummary';

jest.mock('../hooks/useLocalization', () => () => ({ t: (key) => key }));
jest.mock('../services/summaryApi', () => ({ getLessonSummary: jest.fn() }));

import { getLessonSummary } from '../services/summaryApi';

describe('Lesson summary UI', () => {
  beforeEach(() => jest.clearAllMocks());

  test('renders summary metrics from API', async () => {
    getLessonSummary.mockResolvedValue({ accuracy: 88, correct_answers: 8, wrong_answers: 1, learned_words: 3, mistakes: [] });

    render(<LessonSummary />);

    await waitFor(() => expect(screen.getByText('lesson_complete')).toBeInTheDocument());
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('shows API error state', async () => {
    getLessonSummary.mockRejectedValue(new Error('401 unauthorized'));
    render(<LessonSummary />);
    expect(await screen.findByRole('alert')).toHaveTextContent('401 unauthorized');
  });
});

import { useEffect, useMemo, useState } from 'react';
import AccuracyCircle from '../components/AccuracyCircle';
import ActionButtons from '../components/ActionButtons';
import MistakeList from '../components/MistakeList';
import SummaryCard from '../components/SummaryCard';
import { getLessonSummary } from '../services/summaryApi';

const EMPTY_SUMMARY = {
  accuracy: 0,
  correct_answers: 0,
  wrong_answers: 0,
  learned_words: 0,
  mistakes: [],
};

const LessonSummary = () => {
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadSummary = async () => {
      setStatus('loading');
      setError('');

      try {
        const response = await getLessonSummary();

        if (!mounted) {
          return;
        }

        if (!response) {
          setStatus('empty');
          return;
        }

        setSummary({
          accuracy: Number(response.accuracy ?? 0),
          correct_answers: Number(response.correct_answers ?? 0),
          wrong_answers: Number(response.wrong_answers ?? 0),
          learned_words: Number(response.learned_words ?? 0),
          mistakes: Array.isArray(response.mistakes) ? response.mistakes : [],
        });
        setStatus('ready');
      } catch (requestError) {
        if (!mounted) {
          return;
        }

        setStatus('error');
        setError(requestError.message || 'Unable to load lesson summary right now.');
      }
    };

    loadSummary();

    return () => {
      mounted = false;
    };
  }, []);

  const cards = useMemo(
    () => [
      {
        label: 'Correct Answers',
        value: summary.correct_answers,
        icon: '✅',
        tone: 'emerald',
      },
      {
        label: 'Wrong Answers',
        value: summary.wrong_answers,
        icon: '❌',
        tone: 'rose',
      },
      {
        label: 'Words Learned',
        value: summary.learned_words,
        icon: '📚',
        tone: 'indigo',
      },
    ],
    [summary.correct_answers, summary.learned_words, summary.wrong_answers]
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white px-4 py-8">
      <section className="mx-auto w-full max-w-4xl rounded-3xl bg-white p-5 shadow-xl sm:p-8">
        <header className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Lesson Complete 🎉</h1>
          <p className="mt-2 text-base text-gray-600">Great job! Here is your progress.</p>
        </header>

        {status === 'loading' ? (
          <div className="mt-10 space-y-6" aria-busy="true">
            <div className="mx-auto h-40 w-40 animate-pulse rounded-full bg-gray-200" />
            <div className="grid gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-28 animate-pulse rounded-2xl bg-gray-200" />
              ))}
            </div>
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-xl bg-gray-200" />
              ))}
            </div>
          </div>
        ) : null}

        {status === 'error' ? (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
            {error || 'Could not load summary. Please try again.'}
          </div>
        ) : null}

        {status === 'empty' ? (
          <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            No session data found for your latest lesson.
          </div>
        ) : null}

        {status === 'ready' ? (
          <div className="mt-8 space-y-8">
            <div className="flex justify-center">
              <AccuracyCircle accuracy={summary.accuracy} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {cards.map((card) => (
                <SummaryCard key={card.label} label={card.label} value={card.value} icon={card.icon} tone={card.tone} />
              ))}
            </div>

            <section>
              <h2 className="mb-3 text-lg font-bold text-gray-900">Mistakes Review</h2>
              <MistakeList mistakes={summary.mistakes} />
            </section>

            <ActionButtons />
          </div>
        ) : null}
      </section>
    </main>
  );
};

export default LessonSummary;

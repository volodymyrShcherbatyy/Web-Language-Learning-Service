import { Link } from 'react-router-dom';

const LessonSummary = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-xl">
        <h1 className="text-3xl font-bold text-gray-900">Lesson complete</h1>
        <p className="mt-3 text-gray-600">Great work! You finished this lesson session.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/lesson"
            className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            Start another lesson
          </Link>
          <Link
            to="/dashboard"
            className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-800 transition hover:bg-gray-50"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
};

export default LessonSummary;

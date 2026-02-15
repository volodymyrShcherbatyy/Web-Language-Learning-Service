import { useNavigate } from 'react-router-dom';

const ActionButtons = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={() => navigate('/lesson')}
        className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
      >
        Start Next Lesson
      </button>
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-800 transition hover:bg-gray-50"
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default ActionButtons;

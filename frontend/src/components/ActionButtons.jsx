import { useNavigate } from 'react-router-dom';
import useLocalization from '../hooks/useLocalization';

const ActionButtons = () => {
  const navigate = useNavigate();
  const { t } = useLocalization();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={() => navigate('/lesson')}
        className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
      >
        {t('start_next_lesson')}
      </button>
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-800 transition hover:bg-gray-50"
      >
        {t('go_to_dashboard')}
      </button>
    </div>
  );
};

export default ActionButtons;

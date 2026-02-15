import useLocalization from '../hooks/useLocalization';

const ProgressBar = ({ current = 0, total = 0 }) => {
  const { t } = useLocalization();
  const safeTotal = total > 0 ? total : 1;
  const safeCurrent = Math.min(Math.max(current, 0), safeTotal);
  const percent = Math.round((safeCurrent / safeTotal) * 100);

  return (
    <div className="w-full rounded-2xl bg-white p-4 shadow-lg">
      <div className="mb-2 flex items-center justify-between text-sm font-medium text-gray-700">
        <span>{t('exercise_progress').replace('{current}', safeCurrent).replace('{total}', total || 0)}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

export default ProgressBar;

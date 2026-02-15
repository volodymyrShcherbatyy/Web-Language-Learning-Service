import useLocalization from '../hooks/useLocalization';

const StepCard = ({ title, step, totalSteps, children }) => {
  const { t } = useLocalization();

  return (
    <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl">
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-blue-700">
            {t('step_of').replace('{step}', step).replace('{total}', totalSteps)}
          </p>
          <p className="text-sm text-gray-500">{t('profile_setup')}</p>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">{title}</h1>
      </div>
      {children}
    </div>
  );
};

export default StepCard;

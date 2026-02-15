import useLocalization from '../hooks/useLocalization';

const MistakeItem = ({ mistake }) => {
  const { t } = useLocalization();

  return (
    <li className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{t('prompt')}</p>
      <p className="mt-1 text-base font-semibold text-gray-900">{mistake.prompt}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-rose-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">{t('your_answer')}</p>
          <p className="mt-1 text-sm font-semibold text-rose-700">{mistake.user_answer || t('no_answer_provided')}</p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{t('correct_answer')}</p>
          <p className="mt-1 text-sm font-semibold text-emerald-700">{mistake.correct_answer}</p>
        </div>
      </div>
    </li>
  );
};

export default MistakeItem;

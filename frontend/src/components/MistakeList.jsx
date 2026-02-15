import { memo } from 'react';
import useLocalization from '../hooks/useLocalization';
import MistakeItem from './MistakeItem';

const MistakeList = ({ mistakes }) => {
  const { t } = useLocalization();

  if (!mistakes.length) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center text-emerald-800">
        {t('no_mistakes')}
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {mistakes.map((mistake, index) => (
        <MistakeItem key={`${mistake.concept_id ?? 'mistake'}-${index}`} mistake={mistake} />
      ))}
    </ul>
  );
};

export default memo(MistakeList);

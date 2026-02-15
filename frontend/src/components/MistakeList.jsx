import { memo } from 'react';
import MistakeItem from './MistakeItem';

const MistakeList = ({ mistakes }) => {
  if (!mistakes.length) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center text-emerald-800">
        No mistakes this time — perfect lesson!
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

import { useMemo } from 'react';

const AccuracyCircle = ({ accuracy = 0 }) => {
  const normalizedAccuracy = Math.max(0, Math.min(100, Number(accuracy) || 0));
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedAccuracy / 100) * circumference;

  const colorClass = useMemo(() => {
    if (normalizedAccuracy >= 90) {
      return 'text-emerald-500';
    }

    if (normalizedAccuracy >= 70) {
      return 'text-amber-500';
    }

    return 'text-rose-500';
  }, [normalizedAccuracy]);

  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      <svg className="h-40 w-40 -rotate-90" viewBox="0 0 140 140" role="img" aria-label="Lesson accuracy">
        <circle cx="70" cy="70" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-200" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`${colorClass} transition-all duration-500 ease-out`}
        />
      </svg>
      <div className="absolute text-center">
        <div className={`text-3xl font-bold ${colorClass}`}>{normalizedAccuracy}%</div>
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Accuracy</div>
      </div>
    </div>
  );
};

export default AccuracyCircle;

const SummaryCard = ({ label, value, icon, tone = 'indigo' }) => {
  const toneClasses = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
  };

  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${toneClasses[tone] || toneClasses.indigo}`}>
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span className="text-lg" aria-hidden="true">
          {icon}
        </span>
        <span>{label}</span>
      </div>
      <p className="mt-3 text-4xl font-extrabold leading-none">{value}</p>
    </article>
  );
};

export default SummaryCard;

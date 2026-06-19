const PER_PAGE_OPTIONS = [5, 8, 10, 20, 40];

const PerPageSelector = ({ value, onChange }) => {
  return (
    <label className="flex items-center gap-2 text-xs font-semibold text-slate-450 select-none">
      <span>Show</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-lg border border-glass px-2.5 py-1 text-xs bg-slate-900 text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors cursor-pointer"
      >
        {PER_PAGE_OPTIONS.map((opt) => (
          <option key={opt} value={opt} className="bg-bg-deep text-slate-200">
            {opt}
          </option>
        ))}
      </select>
      <span>per page</span>
    </label>
  );
};

export default PerPageSelector;
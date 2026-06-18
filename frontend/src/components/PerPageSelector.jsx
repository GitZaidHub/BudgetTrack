const PER_PAGE_OPTIONS = [5, 8, 10, 20, 40];

const PerPageSelector = ({ value, onChange }) => {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-600">
      Show
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm bg-white
          focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {PER_PAGE_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      per page
    </label>
  );
};

export default PerPageSelector;
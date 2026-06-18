import { RANGE_OPTIONS } from '../utils/dateRanges';

const ReportFilters = ({ activeRange, onRangeChange, onDownload, downloadDisabled }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex gap-2">
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onRangeChange(opt.value)}
            className={`text-sm px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeRange === opt.value
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <button
        onClick={onDownload}
        disabled={downloadDisabled}
        title={downloadDisabled ? 'No expenses to download for this range' : 'Download as CSV'}
        className="text-sm px-3 py-1.5 rounded-md font-medium bg-gray-900 text-white
          hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ⬇ Download CSV
      </button>
    </div>
  );
};

export default ReportFilters;
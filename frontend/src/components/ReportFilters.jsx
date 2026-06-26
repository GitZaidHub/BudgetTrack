import { RANGE_OPTIONS } from '../utils/dateRanges';
import DownloadMenu from './DownloadMenu';

const ReportFilters = ({ activeRange, onRangeChange, onDownloadCsv, onDownloadPdf, downloadDisabled }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex gap-2 flex-wrap">
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

      <DownloadMenu
        onDownloadCsv={onDownloadCsv}
        onDownloadPdf={onDownloadPdf}
        disabled={downloadDisabled}
      />
    </div>
  );
};

export default ReportFilters;
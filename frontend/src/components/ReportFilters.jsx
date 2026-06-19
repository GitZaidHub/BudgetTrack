import { RANGE_OPTIONS } from '../utils/dateRanges';
import DownloadMenu from './DownloadMenu';

const ReportFilters = ({ activeRange, onRangeChange, onDownloadCsv, onDownloadPdf, downloadDisabled }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white/[0.015] border border-glass rounded-2xl p-4 shadow-sm select-none">
      {/* Segmented Controls Pill Box */}
      <div className="flex bg-slate-950/40 border border-glass rounded-xl p-1 gap-1 shrink-0">
        {RANGE_OPTIONS.map((opt) => {
          const isActive = activeRange === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onRangeChange(opt.value)}
              className={`text-xs px-4 py-2 rounded-lg font-bold tracking-wide transition-all cursor-pointer ${
                isActive
                  ? 'bg-white/5 border border-glass text-white shadow-md'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Action Download Dropdown Menu */}
      <DownloadMenu
        onDownloadCsv={onDownloadCsv}
        onDownloadPdf={onDownloadPdf}
        disabled={downloadDisabled}
      />
    </div>
  );
};

export default ReportFilters;
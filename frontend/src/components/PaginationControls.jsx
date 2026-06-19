import { ChevronLeft, ChevronRight } from 'lucide-react';

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <div className="flex items-center justify-center gap-4 select-none">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirstPage}
        className="inline-flex items-center gap-1 text-xs px-3.5 py-2 rounded-xl font-bold border border-glass
          bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-35
          disabled:cursor-not-allowed transition-all cursor-pointer active:scale-[0.97]"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Previous</span>
      </button>

      <span className="text-xs font-semibold text-slate-400">
        Page <span className="text-slate-200">{currentPage}</span> of{' '}
        <span className="text-slate-200">{totalPages}</span>
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLastPage}
        className="inline-flex items-center gap-1 text-xs px-3.5 py-2 rounded-xl font-bold border border-glass
          bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-35
          disabled:cursor-not-allowed transition-all cursor-pointer active:scale-[0.97]"
      >
        <span>Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default PaginationControls;
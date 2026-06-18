const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirstPage}
        className="text-sm px-3 py-1.5 rounded-md font-medium border border-gray-300
          bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40
          disabled:cursor-not-allowed transition-colors"
      >
        ← Previous
      </button>

      <span className="text-sm text-gray-500">
        Page <span className="font-medium text-gray-900">{currentPage}</span> of{' '}
        <span className="font-medium text-gray-900">{totalPages}</span>
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLastPage}
        className="text-sm px-3 py-1.5 rounded-md font-medium border border-gray-300
          bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40
          disabled:cursor-not-allowed transition-colors"
      >
        Next →
      </button>
    </div>
  );
};

export default PaginationControls;
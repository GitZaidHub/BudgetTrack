import { useState } from 'react';
import { CATEGORY_COLORS } from '../utils/categories';

const formatAmount = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);

const formatDate = (isoString) =>
  new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const ExpenseItem = ({ expense, onDelete }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(expense.id);
    } catch {
      setDeleting(false); // only reset on failure — on success the row unmounts
    }
  };

  const badgeClass = CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.Other;

  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${badgeClass}`}>
          {expense.category}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{expense.description}</p>
          <p className="text-xs text-gray-400">{formatDate(expense.createdAt)}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <span className="text-sm font-semibold text-gray-900">
          {formatAmount(expense.amount)}
        </span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          aria-label={`Delete expense: ${expense.description}`}
          className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {deleting ? '…' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

export default ExpenseItem;
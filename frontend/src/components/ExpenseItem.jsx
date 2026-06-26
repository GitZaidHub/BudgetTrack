import { useState } from 'react';
import { CATEGORY_COLORS } from '../utils/categories';
import { AnimatePresence, motion } from 'framer-motion';
import { Trash2, Calendar, AlertTriangle } from 'lucide-react';
import Button from './Button';

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

const getCategoryStyle = (category) => {
  const styles = {
    Food: 'bg-orange-900/25 text-orange-300 border border-orange-800/40',
    Petrol: 'bg-sky-900/25 text-sky-300 border border-sky-800/40',
    Salary: 'bg-green-900/25 text-green-300 border border-green-800/40',
    Entertainment: 'bg-purple-900/25 text-purple-300 border border-purple-800/40',
    Health: 'bg-red-900/25 text-red-300 border border-red-800/40',
    Shopping: 'bg-pink-900/25 text-pink-300 border border-pink-800/40',
    Bills: 'bg-amber-900/25 text-amber-300 border border-amber-800/40',
    Travel: 'bg-cyan-900/25 text-cyan-300 border border-cyan-800/40',
    Other: 'bg-slate-700/30 text-slate-300 border border-slate-700/50',
  };
  return styles[category] || styles.Other;
};

const ExpenseItem = ({ expense, onDelete }) => {
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    setShowConfirm(false);
    try {
      await onDelete(expense.id);
    } catch (error) {
      // Reset states on error, showing confirmation modal again
      setDeleting(false);
      setShowConfirm(true);
    }
  };

  const badgeClass = getCategoryStyle(expense.category);

  return (
    <>
      {/* List Item Row */}
      <div className="flex items-center justify-between py-4 px-6 hover:bg-white/[0.02] border-b border-glass transition-colors group">
        <div className="flex items-center gap-3.5 min-w-0">
          <span className={`shrink-0 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase ${badgeClass}`}>
            {expense.category}
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold text-slate-100 truncate group-hover:text-white transition-colors">
              {expense.description}
            </p>
            <p>
              {expense.note && (
  <p className="text-xs text-gray-400 mt-0.5 italic">"{expense.note}"</p>
)}
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>{formatDate(expense.createdAt)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <span className="text-sm font-bold text-white tracking-tight">
            {formatAmount(expense.amount)}
          </span>
          
          <button
            onClick={() => setShowConfirm(true)}
            disabled={deleting}
            aria-label={`Delete expense: ${expense.description}`}
            className="p-2 rounded-lg border border-glass bg-white/5 text-slate-500 hover:text-red-400 hover:bg-red-900/20 hover:border-red-800/40 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Animated Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-sm glass-panel border border-glass rounded-2xl p-6 shadow-2xl relative z-10 space-y-5"
            >
              <div className="flex gap-3 items-start">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-900/30 border border-red-800/40 text-red-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Delete Transaction</h3>
                  <p className="text-xs text-slate-350 leading-relaxed">
                    Are you sure you want to delete <span className="font-semibold text-slate-200">"{expense.description}"</span> of <span className="font-semibold text-slate-200">{formatAmount(expense.amount)}</span>? This cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="secondary" onClick={() => setShowConfirm(false)}>
                  Cancel
                </Button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-red-700 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-700/20 hover:shadow-red-700/30 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ExpenseItem;
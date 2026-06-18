import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getExpenses } from '../api/expenseApi';
import { filterByRange } from '../utils/dateRanges';
import { exportExpensesToCsv } from '../utils/exportCsv';
import ReportFilters from '../components/ReportFilters';
import ExpenseList from '../components/ExpenseList';
import EmptyState from '../components/EmptyState';
import { exportExpensesToPdf } from '../utils/exportPdf';
import { useAuth } from '../context/AuthContext';



const formatAmount = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const ReportPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeRange, setActiveRange] = useState('all');
  const { user } = useAuth();

const handleDownloadPdf = () => {
  exportExpensesToPdf(filteredExpenses, activeRange, user?.username);
};

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const { data } = await getExpenses();
        setExpenses(data.expenses);
      } catch {
        setError('Could not load your expenses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const filteredExpenses = useMemo(
    () => filterByRange(expenses, activeRange),
    [expenses, activeRange]
  );

  const total = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  const handleDownload = () => {
    exportExpensesToCsv(filteredExpenses, `expenses-${activeRange}.csv`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Expense report</h1>
          <Link to="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-500">
            ← Back to dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {loading && <p className="text-sm text-gray-500 text-center py-8">Loading…</p>}
        {!loading && error && <p className="text-sm text-red-600 text-center py-8">{error}</p>}

        {!loading && !error && (
          <>
            <ReportFilters
  activeRange={activeRange}
  onRangeChange={setActiveRange}
  onDownloadCsv={handleDownload}
  onDownloadPdf={handleDownloadPdf}
  downloadDisabled={filteredExpenses.length === 0}
/>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">
                  {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
                </h2>
                <span className="text-sm font-medium text-gray-500">
                  Total: {formatAmount(total)}
                </span>
              </div>

              {filteredExpenses.length === 0 ? (
                <EmptyState />
              ) : (
                <ExpenseList expenses={filteredExpenses} onDelete={() => {}} />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ReportPage;
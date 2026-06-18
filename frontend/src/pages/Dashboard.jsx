import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { getExpenses, createExpense, deleteExpense } from '../api/expenseApi';
import usePersistedState from '../hooks/usePersistedState';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import PaginationControls from '../components/PaginationControls';
import PerPageSelector from '../components/PerPageSelector';
import PremiumButton from '../components/PremiumButton';
import PremiumBanner from '../components/PremiumBanner';
import Button from '../components/Button';

const Dashboard = () => {
  const { user, logout, refreshUser } = useAuth();

  // Per-page preference persists across sessions per your spec.
  // Page number deliberately does NOT persist — landing back on
  // page 7 after a fresh login would be a confusing default.
  const [limit, setLimit] = usePersistedState('expensesPerPage', 10);
  const [currentPage, setCurrentPage] = useState(1);

  const [expenses, setExpenses] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const fetchExpenses = useCallback(async (page, perPage) => {
    setLoading(true);
    setLoadError('');
    try {
      const { data } = await getExpenses(page, perPage);

      // Edge case: if the requested page is beyond the actual last
      // page (e.g., we deleted expenses and our local `currentPage`
      // is now stale), snap back to the real last page automatically
      // instead of showing a confusing empty list with valid-looking
      // pagination controls.
      if (data.totalPages < page && data.totalPages >= 1) {
        setCurrentPage(data.totalPages);
        return; // the state change above re-triggers this effect
      }

      setExpenses(data.expenses);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch {
      setLoadError('Could not load your expenses. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses(currentPage, limit);
  }, [currentPage, limit, fetchExpenses]);

  const handleAdd = async ({ amount, description, category }) => {
    await createExpense(amount, description, category);
    // A new expense changes which items belong on which page (it's
    // newest-first, so it always lands on page 1). Simplest correct
    // behavior: jump to page 1 and refetch, rather than trying to
    // manually splice it into whatever page is currently shown.
    setCurrentPage(1);
    await fetchExpenses(1, limit);
  };

  const handleDelete = async (id) => {
    await deleteExpense(id);

    // If this was the last item on the current page (and we're not
    // already on page 1), deleting it would otherwise leave the user
    // staring at an empty page. Step back a page in that case.
    const isLastItemOnPage = expenses.length === 1 && currentPage > 1;
    const targetPage = isLastItemOnPage ? currentPage - 1 : currentPage;

    if (targetPage !== currentPage) {
      setCurrentPage(targetPage);
    } else {
      await fetchExpenses(targetPage, limit);
    }
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1); // changing page size invalidates the old page number
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {user?.isPremium && <PremiumBanner />}

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">AI Expense Tracker</h1>
          <div className="flex items-center gap-4">
            {!user?.isPremium && <PremiumButton onUpgradeSuccess={refreshUser} />}
            <span className="text-sm text-gray-600">Hi, {user?.username}</span>
            <Button variant="secondary" onClick={logout}>
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {user?.isPremium && (
          <div className="flex gap-3">
            <Link to="/leaderboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              🏆 View leaderboard
            </Link>
            <Link to="/report" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              📊 View report
            </Link>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Add an expense</h2>
          <ExpenseForm onAdd={handleAdd} />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Your expenses {totalCount > 0 && <span className="text-gray-400">({totalCount})</span>}
            </h2>
            <PerPageSelector value={limit} onChange={handleLimitChange} />
          </div>

          {loading && <p className="text-sm text-gray-500 px-6 py-8 text-center">Loading…</p>}

          {!loading && loadError && (
            <p className="text-sm text-red-600 px-6 py-8 text-center">{loadError}</p>
          )}

          {!loading && !loadError && (
            <>
              <ExpenseList expenses={expenses} onDelete={handleDelete} />

              {totalCount > 0 && (
                <div className="px-6 py-4 border-t border-gray-100">
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
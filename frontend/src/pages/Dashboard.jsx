import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import PremiumButton from '../components/PremiumButton';
import PremiumBanner from '../components/PremiumBanner';
import { getExpenses, createExpense, deleteExpense } from '../api/expenseApi';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import Button from '../components/Button';

const Dashboard = () => {
  const { user, logout, refreshUser } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const { data } = await getExpenses();
      setExpenses(data.expenses);
    } catch {
      setLoadError('Could not load your expenses. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Optimistic-ish add: we wait for the server response (since we need
  // the real id/createdAt), but prepend it immediately on success so
  // the list updates without a full refetch.
  const handleAdd = async ({ amount, description, category }) => {
    const { data } = await createExpense(amount, description, category);
    setExpenses((prev) => [data.expense, ...prev]);
  };

  const handleDelete = async (id) => {
    await deleteExpense(id);
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {user?.isPremium && <PremiumBanner />}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">AI Expense Tracker</h1>
          <div className="flex items-center gap-4">
          {!user?.isPremium && (<PremiumButton onUpgradeSuccess={refreshUser} />)}
            <span className="text-sm text-gray-600">Hi, {user?.username}</span>
            <Button variant="secondary" onClick={logout}>
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Add an expense</h2>
          <ExpenseForm onAdd={handleAdd} />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Your expenses</h2>
            {!loading && expenses.length > 0 && (
              <span className="text-sm font-medium text-gray-500">
                Total: {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                }).format(total)}
              </span>
            )}
          </div>

          {loading && <p className="text-sm text-gray-500 px-6 py-8 text-center">Loading…</p>}

          {!loading && loadError && (
            <p className="text-sm text-red-600 px-6 py-8 text-center">{loadError}</p>
          )}

          {!loading && !loadError && (
            <ExpenseList expenses={expenses} onDelete={handleDelete} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
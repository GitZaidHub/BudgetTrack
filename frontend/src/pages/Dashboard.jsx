import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link, useLocation } from 'react-router-dom';
import { getExpenses, createExpense, deleteExpense } from '../api/expenseApi';
import usePersistedState from '../hooks/usePersistedState';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import PaginationControls from '../components/PaginationControls';
import PerPageSelector from '../components/PerPageSelector';
import PremiumButton from '../components/PremiumButton';
import PremiumBanner from '../components/PremiumBanner';
import {
  IndianRupee,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Plus
} from 'lucide-react';

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();

  const [limit, setLimit] = usePersistedState('expensesPerPage', 10);
  const [currentPage, setCurrentPage] = useState(1);

  const [expenses, setExpenses] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Fetch full stats for metric widgets (Total expenses & monthly expenses)
  const fetchAllStats = useCallback(async () => {
    try {
      const { data } = await getExpenses();
      setAllExpenses(data.expenses || []);
    } catch {
      // Silently fall back to paginated list for stats if this fails
    }
  }, []);

  const fetchExpenses = useCallback(async (page, perPage) => {
    setLoading(true);
    setLoadError('');
    try {
      const { data } = await getExpenses(page, perPage);

      if (data.totalPages < page && data.totalPages >= 1) {
        setCurrentPage(data.totalPages);
        return;
      }

      setExpenses(data.expenses);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch {
      setLoadError('Could not load your expenses. Please refresh the page.');
      showToast('Could not load expenses', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchExpenses(currentPage, limit),
      fetchAllStats()
    ]);
  }, [currentPage, limit, fetchExpenses, fetchAllStats]);

  useEffect(() => {
    refreshData();
  }, [currentPage, limit]);

  // Handle anchor scroll
  useEffect(() => {
    if (location.state?.scrollToExpenses || location.hash === '#expenses') {
      setTimeout(() => {
        const el = document.getElementById('expenses-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 350);
      // Clear location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleAdd = async ({ amount, description, category }) => {
    try {
      await createExpense(amount, description, category);
      showToast('Expense added successfully!', 'success');
      setCurrentPage(1);
      await refreshData();
    } catch (err) {
      showToast('Failed to add expense', 'error');
      throw err; // rethrow to let form show validation / server error
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      showToast('Expense deleted successfully', 'info');
      
      const isLastItemOnPage = expenses.length === 1 && currentPage > 1;
      const targetPage = isLastItemOnPage ? currentPage - 1 : currentPage;

      if (targetPage !== currentPage) {
        setCurrentPage(targetPage);
      } else {
        await refreshData();
      }
    } catch (err) {
      showToast('Failed to delete expense', 'error');
      throw err;
    }
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  // Metric Calculation Logic
  const totalAmount = allExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  
  const now = new Date();
  const currentMonthExpenses = allExpenses.filter((exp) => {
    const d = new Date(exp.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthlyAmount = currentMonthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  // Month-over-month trend
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthExpenses = allExpenses.filter((exp) => {
    const d = new Date(exp.createdAt);
    return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
  });
  const lastMonthAmount = lastMonthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  
  let monthlyTrend = 0;
  let isTrendUp = false;
  if (lastMonthAmount > 0) {
    monthlyTrend = ((monthlyAmount - lastMonthAmount) / lastMonthAmount) * 100;
    isTrendUp = monthlyTrend > 0;
  }

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);

  return (
    <div className="space-y-8 pb-16">
      {user?.isPremium && <PremiumBanner />}

      {/* Greeting Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold tracking-tight text-white flex items-center gap-2">
            Welcome back, {user?.username}
            {user?.isPremium && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-900/30 text-amber-300 border border-amber-800/40 font-bold font-sans">
                <Sparkles className="w-3 h-3 fill-amber-300" /> Premium
              </span>
            )}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Here is your spending outline for today.
          </p>
        </div>

        {/* Upgrade Button if Free */}
        {!user?.isPremium && (
          <div className="shrink-0">
            <PremiumButton onUpgradeSuccess={refreshUser} />
          </div>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Expenses */}
        <div className="glass-panel border border-glass rounded-2xl p-5 relative overflow-hidden group hover:border-blue-700/30 transition-colors shadow-lg">
          <div className="absolute top-0 right-0 p-3 text-blue-400/8 group-hover:text-blue-400/15 transition-colors">
            <IndianRupee className="w-16 h-16" />
          </div>
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-dim tracking-wider uppercase">Total Expenses</span>
              <span className="p-1.5 rounded-lg bg-blue-900/25 text-blue-400">
                <IndianRupee className="w-4 h-4" />
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {loading && allExpenses.length === 0 ? '...' : formatCurrency(totalAmount)}
              </h3>
              <p className="text-[11px] text-dim font-medium flex items-center gap-1">
                <span>All-time accumulated spending</span>
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Monthly Expenses */}
        <div className="glass-panel border border-glass rounded-2xl p-5 relative overflow-hidden group hover:border-purple-700/30 transition-colors shadow-lg">
          <div className="absolute top-0 right-0 p-3 text-purple-400/8 group-hover:text-purple-400/15 transition-colors">
            <Calendar className="w-16 h-16" />
          </div>
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-dim tracking-wider uppercase">Monthly Expenses</span>
              <span className="p-1.5 rounded-lg bg-purple-900/25 text-purple-400">
                <Calendar className="w-4 h-4" />
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {loading && allExpenses.length === 0 ? '...' : formatCurrency(monthlyAmount)}
              </h3>
              {monthlyTrend !== 0 ? (
                <p className={`text-[11px] font-bold flex items-center gap-1 ${
                  isTrendUp ? 'text-red-400' : 'text-green-400'
                }`}>
                  {isTrendUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{Math.abs(monthlyTrend).toFixed(1)}% MoM change</span>
                </p>
              ) : (
                <p className="text-[11px] text-dim font-medium">This month</p>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Transactions Count */}
        <div className="glass-panel border border-glass rounded-2xl p-5 relative overflow-hidden group hover:border-teal-700/30 transition-colors shadow-lg">
          <div className="absolute top-0 right-0 p-3 text-teal-400/8 group-hover:text-teal-400/15 transition-colors">
            <Layers className="w-16 h-16" />
          </div>
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-dim tracking-wider uppercase">Transactions</span>
              <span className="p-1.5 rounded-lg bg-teal-900/25 text-teal-400">
                <Layers className="w-4 h-4" />
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {totalCount}
              </h3>
              <p className="text-[11px] text-dim font-medium">Recorded database receipts</p>
            </div>
          </div>
        </div>

        {/* Card 4: Tier Level */}
        <div className="glass-panel border border-glass rounded-2xl p-5 relative overflow-hidden group hover:border-amber-700/30 transition-colors shadow-lg">
          <div className="absolute top-0 right-0 p-3 text-amber-400/8 group-hover:text-amber-400/15 transition-colors">
            <Sparkles className="w-16 h-16" />
          </div>
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-dim tracking-wider uppercase">Account Tier</span>
              <span className="p-1.5 rounded-lg bg-amber-900/25 text-amber-400">
                <Sparkles className="w-4 h-4" />
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {user?.isPremium ? 'Premium' : 'Free tier'}
              </h3>
              <p className="text-[11px] text-dim font-medium">
                {user?.isPremium ? 'Unlock all SaaS options' : 'Locked analytics reports'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form and Expense List Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Container */}
        <div className="lg:col-span-1 glass-panel border border-glass rounded-2xl p-6 shadow-xl relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.015] to-transparent rounded-2xl pointer-events-none" />
          <h2 className="text-lg font-bold text-white mb-4">Add Expense</h2>
          <ExpenseForm onAdd={handleAdd} />
        </div>

        {/* List Container */}
        <div id="expenses-section" className="lg:col-span-2 glass-panel border border-glass rounded-2xl overflow-hidden shadow-xl">
          {/* Header Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-glass bg-white/[0.01]">
            <h2 className="text-lg font-bold text-white">
              Transactions {totalCount > 0 && <span className="text-slate-400 text-xs font-medium ml-1">({totalCount})</span>}
            </h2>
            <PerPageSelector value={limit} onChange={handleLimitChange} />
          </div>

          {/* Skeleton Loaders for lists */}
          {loading && (
            <div className="divide-y divide-glass px-6 py-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="py-4 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3 w-2/3">
                    <div className="w-16 h-6 rounded-full shimmer-state shrink-0" />
                    <div className="space-y-2 w-full">
                      <div className="w-1/2 h-4 rounded shimmer-state" />
                      <div className="w-1/3 h-3 rounded shimmer-state" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-4 rounded shimmer-state" />
                    <div className="w-8 h-4 rounded shimmer-state" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && loadError && (
            <div className="text-center py-12 px-6">
              <p className="text-sm text-rose-400">{loadError}</p>
            </div>
          )}

          {!loading && !loadError && (
            <>
              <ExpenseList expenses={expenses} onDelete={handleDelete} />

              {totalCount > 0 && (
                <div className="px-6 py-4 border-t border-glass bg-white/[0.005]">
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
      </div>
    </div>
  );
};

export default Dashboard;
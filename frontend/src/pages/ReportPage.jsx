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
import { useToast } from '../context/ToastContext';
import { BarChart3, TrendingUp, Calendar, AlertCircle, FileText, ArrowDownWideNarrow, Layers, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const formatAmount = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount);

const ReportPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeRange, setActiveRange] = useState('all');
  const [downloading, setDownloading] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const { data } = await getExpenses();
        setExpenses(data.expenses || []);
      } catch {
        const msg = 'Could not load your expenses. Please try again.';
        setError(msg);
        showToast(msg, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [showToast]);

  const filteredExpenses = useMemo(
    () => filterByRange(expenses, activeRange),
    [expenses, activeRange]
  );

  const total = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  }, [filteredExpenses]);

  // Compute insights
  const avgExpense = useMemo(() => {
    return filteredExpenses.length > 0 ? total / filteredExpenses.length : 0;
  }, [filteredExpenses, total]);

  const maxExpense = useMemo(() => {
    return filteredExpenses.length > 0
      ? Math.max(...filteredExpenses.map((e) => parseFloat(e.amount)))
      : 0;
  }, [filteredExpenses]);

  // Sort chronologically for timeline mapping
  const chronologicalExpenses = useMemo(() => {
    return [...filteredExpenses].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [filteredExpenses]);

  // Generate SVG Path for the chronological spending timeline
  const chartPathData = useMemo(() => {
    if (chronologicalExpenses.length < 2) return { path: '', points: [] };
    const width = 500;
    const height = 120;
    const padding = 15;

    const maxAmt = Math.max(...chronologicalExpenses.map((e) => parseFloat(e.amount))) || 1;
    const minAmt = 0; // Baseline zero

    const points = chronologicalExpenses.map((exp, index) => {
      const x = padding + (index / (chronologicalExpenses.length - 1)) * (width - padding * 2);
      const amt = parseFloat(exp.amount);
      // Map height (high amount = low Y in SVG grid coordinate)
      const y = height - padding - ((amt - minAmt) / (maxAmt - minAmt)) * (height - padding * 2);
      return { x, y };
    });

    // Generate smooth line curve
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      d += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`;
    }
    d += ` T ${points[points.length - 1].x} ${points[points.length - 1].y}`;
    return { path: d, points };
  }, [chronologicalExpenses]);

  const handleDownloadCsv = () => {
    try {
      setDownloading(true);
      exportExpensesToCsv(filteredExpenses, `expenses-${activeRange}.csv`);
      showToast('CSV Spreadsheet downloaded!', 'success');
    } catch {
      showToast('CSV download failed', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPdf = () => {
    try {
      setDownloading(true);
      exportExpensesToPdf(filteredExpenses, activeRange, user?.username);
      showToast('PDF Document exported successfully!', 'success');
    } catch {
      showToast('PDF download failed', 'error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-display font-extrabold tracking-tight text-white flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-indigo-400 fill-indigo-400/10" />
          <span>Expense Analytics</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Generate structured reports, analyze category splits, and download summaries.
        </p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm text-slate-400">Compiling financial metrics...</p>
        </div>
      )}

      {!loading && error && (
        <div className="glass-panel border border-rose-500/20 rounded-2xl p-8 text-center text-rose-400">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Segmented Filter bar */}
          <ReportFilters
            activeRange={activeRange}
            onRangeChange={setActiveRange}
            onDownloadCsv={handleDownloadCsv}
            onDownloadPdf={handleDownloadPdf}
            downloadDisabled={filteredExpenses.length === 0 || downloading}
          />

          {filteredExpenses.length === 0 ? (
            <div className="glass-panel border border-glass rounded-2xl">
              <EmptyState
                title="No report entries"
                subtitle="Change filter range or add expenses to populate report metrics."
                icon={AlertCircle}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Left Column: Summary Cards & Chart Visuals */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Insights Summary Widgets */}
                <div className="glass-panel border border-glass rounded-2xl p-5 space-y-4 shadow-lg">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Summary Outline</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/[0.02] border border-glass rounded-xl space-y-1">
                      <span className="text-[10px] font-semibold text-dim uppercase">Total spent</span>
                      <p className="text-sm font-bold text-white truncate">{formatAmount(total)}</p>
                    </div>

                    <div className="p-3 bg-white/[0.02] border border-glass rounded-xl space-y-1">
                      <span className="text-[10px] font-semibold text-dim uppercase">Transactions</span>
                      <p className="text-sm font-bold text-white">{filteredExpenses.length}</p>
                    </div>

                    <div className="p-3 bg-white/[0.02] border border-glass rounded-xl space-y-1">
                      <span className="text-[10px] font-semibold text-dim uppercase">Average Cost</span>
                      <p className="text-sm font-bold text-white truncate">{formatAmount(avgExpense)}</p>
                    </div>

                    <div className="p-3 bg-white/[0.02] border border-glass rounded-xl space-y-1">
                      <span className="text-[10px] font-semibold text-dim uppercase">Peak expense</span>
                      <p className="text-sm font-bold text-white truncate">{formatAmount(maxExpense)}</p>
                    </div>
                  </div>
                </div>

                {/* Interactive SVG Trend Chart */}
                <div className="glass-panel border border-glass rounded-2xl p-5 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Spending Timeline</h3>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase">
                      <TrendingUp className="w-3 h-3" /> Live
                    </span>
                  </div>

                  {chronologicalExpenses.length < 2 ? (
                    <div className="h-32 flex items-center justify-center border border-dashed border-glass rounded-xl text-center text-xs text-dim p-4">
                      Add at least 2 expenses in this range to plot a chronological trend line.
                    </div>
                  ) : (
                    <div className="relative pt-2">
                      <svg viewBox="0 0 500 130" className="w-full h-32 text-indigo-500 overflow-visible">
                        <defs>
                          <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        
                        {/* Area Shading */}
                        <path
                          d={`${chartPathData.path} L ${chartPathData.points[chartPathData.points.length - 1].x} 120 L ${chartPathData.points[0].x} 120 Z`}
                          fill="url(#chartGlow)"
                        />

                        {/* Spline Path */}
                        <path
                          d={chartPathData.path}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="drop-shadow-[0_2px_8px_rgba(99,102,241,0.4)]"
                        />

                        {/* Anchor points */}
                        {chartPathData.points.map((p, idx) => (
                          <circle
                            key={idx}
                            cx={p.x}
                            cy={p.y}
                            r="3"
                            className="fill-bg-deep stroke-indigo-400 stroke-[2] cursor-pointer hover:r-[5] transition-all"
                          />
                        ))}
                      </svg>
                      
                      <div className="flex justify-between items-center text-[9px] text-dim font-bold pt-2 select-none">
                        <span>{new Date(chronologicalExpenses[0].createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        <span>Chronological Trend</span>
                        <span>{new Date(chronologicalExpenses[chronologicalExpenses.length - 1].createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Transaction List Details */}
              <div className="lg:col-span-2 glass-panel border border-glass rounded-2xl overflow-hidden shadow-xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-glass bg-white/[0.01]">
                  <h3 className="text-base font-bold text-white">Statement breakdown</h3>
                  <span className="text-xs font-semibold text-slate-400">
                    Showing {filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <ExpenseList expenses={filteredExpenses} onDelete={() => {}} />
              </div>

            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportPage;
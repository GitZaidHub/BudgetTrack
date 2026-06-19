import { useState, useEffect } from 'react';
import { getLeaderboard } from '../api/premiumApi';
import { useToast } from '../context/ToastContext';
import LeaderboardTable from '../components/LeaderboardTable';
import EmptyState from '../components/EmptyState';
import { Trophy, Award, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const formatAmount = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await getLeaderboard();
        setLeaderboard(data.leaderboard || []);
      } catch {
        const msg = 'Could not load the leaderboard. Please try again.';
        setError(msg);
        showToast(msg, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [showToast]);

  // Split top 3 for the podium and the rest for the table list
  const top3 = leaderboard.slice(0, 3);
  const remainder = leaderboard.slice(3);

  // We want the podium order to be: Silver (2nd) - Gold (1st) - Bronze (3rd)
  const podiumOrder = [];
  if (top3[1]) podiumOrder.push({ ...top3[1], rank: 2, badge: '🥈', color: 'text-slate-350', height: 'h-36', label: 'Silver' });
  if (top3[0]) podiumOrder.push({ ...top3[0], rank: 1, badge: '🥇', color: 'text-amber-400', height: 'h-44', label: 'Gold' });
  if (top3[2]) podiumOrder.push({ ...top3[2], rank: 3, badge: '🥉', color: 'text-amber-700', height: 'h-32', label: 'Bronze' });

  return (
    <div className="space-y-8 pb-16">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-display font-extrabold tracking-tight text-white flex items-center gap-2">
          <Trophy className="w-8 h-8 text-amber-450 fill-amber-450/10" />
          <span>Savings Leaderboard</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          A showcase of savings champions. Lower expenses rank higher on the podium.
        </p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm text-slate-400">Fetching ranking tables...</p>
        </div>
      )}

      {!loading && error && (
        <div className="glass-panel border border-glass rounded-2xl p-8 text-center text-rose-450">
          {error}
        </div>
      )}

      {!loading && !error && leaderboard.length === 0 && (
        <div className="glass-panel border border-glass rounded-2xl">
          <EmptyState
            title="Leaderboard is empty"
            subtitle="No spending activity recorded in the database yet."
            icon={Award}
          />
        </div>
      )}

      {!loading && !error && leaderboard.length > 0 && (
        <div className="space-y-8">
          {/* Top 3 Podium Cards */}
          {top3.length > 0 && (
            <div className="flex items-end justify-center gap-4 md:gap-6 pt-12 max-w-2xl mx-auto px-4 select-none">
              {podiumOrder.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                  className={`flex-1 flex flex-col items-center relative ${
                    user.rank === 1 ? 'z-20' : 'z-10'
                  }`}
                >
                  {/* Floating Trophy & Avatar Overlay */}
                  <div className="relative mb-3 flex flex-col items-center">
                    <span className="text-3xl animate-bounce" style={{ animationDuration: user.rank === 1 ? '3s' : '4s' }}>
                      {user.badge}
                    </span>
                    
                    {user.rank === 1 && (
                      <span className="absolute top-[-15px] text-amber-300">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                      </span>
                    )}

                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center font-display font-extrabold text-lg mt-1 border-2 shadow-lg ${
                      user.rank === 1
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-amber-500/5'
                        : user.rank === 2
                        ? 'bg-slate-450/10 border-slate-400/30 text-slate-300'
                        : 'bg-amber-700/10 border-amber-700/30 text-amber-600'
                    }`}>
                      {user.username.substring(0, 2).toUpperCase()}
                    </div>
                  </div>

                  {/* Visual Podium Column */}
                  <div
                    className={`w-full ${user.height} glass-panel border border-glass rounded-t-2xl flex flex-col justify-end p-4 text-center space-y-1 relative overflow-hidden ${
                      user.rank === 1 ? 'border-amber-500/20 bg-amber-500/[0.03]' : ''
                    }`}
                  >
                    {/* Inner subtle glow for Gold */}
                    {user.rank === 1 && (
                      <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-amber-500/[0.08] to-transparent pointer-events-none" />
                    )}

                    <h4 className="text-xs md:text-sm font-bold text-white truncate max-w-full">
                      {user.username}
                    </h4>
                    <p className="text-[10px] md:text-xs font-bold text-slate-350">
                      {formatAmount(user.totalExpenses)}
                    </p>
                    <span className="text-[10px] text-dim tracking-wider uppercase font-semibold">
                      Rank {user.rank}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Remainder Table Section */}
          <div className="glass-panel border border-glass rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-glass bg-white/[0.01]">
              <h3 className="text-base font-bold text-white">Ranking Standings</h3>
            </div>
            
            <LeaderboardTable leaderboard={remainder} startIndex={3} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
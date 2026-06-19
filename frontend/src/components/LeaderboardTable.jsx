import { useAuth } from '../context/AuthContext';
import { User } from 'lucide-react';

const formatAmount = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const rankBadge = (index, startIndex) => {
  const actualRank = index + startIndex;
  if (actualRank === 0) return '🥇';
  if (actualRank === 1) return '🥈';
  if (actualRank === 2) return '🥉';
  return `#${actualRank + 1}`;
};

const LeaderboardTable = ({ leaderboard, startIndex = 0 }) => {
  const { user } = useAuth();

  if (leaderboard.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-dim">
        No additional rankings to show.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-white/[0.015] border-b border-glass text-slate-400 font-semibold uppercase tracking-wider text-xs">
          <tr>
            <th className="px-6 py-4 w-20">Rank</th>
            <th className="px-6 py-4">User</th>
            <th className="px-6 py-4 text-right">Total spent</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-glass select-none">
          {leaderboard.map((entry, index) => {
            const isCurrentUser = entry.id === user?.id;
            const rankLabel = rankBadge(index, startIndex);
            const actualRank = index + startIndex;

            return (
              <tr
                key={entry.id}
                className={`transition-colors hover:bg-white/[0.01] ${
                  isCurrentUser
                    ? 'bg-indigo-500/[0.06] hover:bg-indigo-500/[0.08]'
                    : ''
                }`}
              >
                {/* Rank Column */}
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center justify-center font-display font-extrabold ${
                    actualRank < 3
                      ? 'text-lg'
                      : 'text-xs px-2 py-0.5 rounded-md bg-white/5 border border-glass text-slate-400'
                  }`}>
                    {rankLabel}
                  </span>
                </td>

                {/* User Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCurrentUser
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        : 'bg-white/5 text-slate-300 border border-glass'
                    }`}>
                      {entry.username.substring(0, 2).toUpperCase()}
                    </span>
                    <span className={`font-semibold ${isCurrentUser ? 'text-indigo-400' : 'text-slate-200'}`}>
                      {entry.username}
                    </span>
                    {isCurrentUser && (
                      <span className="text-[10px] bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                        YOU
                      </span>
                    )}
                  </div>
                </td>

                {/* Total Spent Column */}
                <td className="px-6 py-4 text-right">
                  <span className={`font-bold font-sans tracking-tight text-sm ${
                    isCurrentUser ? 'text-indigo-400' : 'text-slate-100'
                  }`}>
                    {formatAmount(entry.totalExpenses)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;
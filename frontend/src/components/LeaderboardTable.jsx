import { useAuth } from '../context/AuthContext';

const formatAmount = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const rankBadge = (index) => {
  if (index === 0) return '🥇';
  if (index === 1) return '🥈';
  if (index === 2) return '🥉';
  return `${index + 1}`;
};

const LeaderboardTable = ({ leaderboard }) => {
  const { user } = useAuth();

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-500">
          <tr>
            <th className="px-4 py-3 font-medium w-16">Rank</th>
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium text-right">Total spent</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {leaderboard.map((entry, index) => {
            const isCurrentUser = entry.id === user?.id;
            return (
              <tr key={entry.id} className={isCurrentUser ? 'bg-indigo-50' : ''}>
                <td className="px-4 py-3 font-medium">{rankBadge(index)}</td>
                <td className="px-4 py-3">
                  {entry.username}
                  {isCurrentUser && (
                    <span className="ml-2 text-xs text-indigo-600 font-medium">(you)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                  {formatAmount(entry.totalExpenses)}
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
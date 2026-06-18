import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLeaderboard } from '../api/premiumApi';
import LeaderboardTable from '../components/LeaderboardTable';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await getLeaderboard();
        setLeaderboard(data.leaderboard);
      } catch {
        setError('Could not load the leaderboard. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Leaderboard</h1>
          <Link to="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-500">
            ← Back to dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {loading && <p className="text-sm text-gray-500 text-center py-8">Loading…</p>}
        {!loading && error && <p className="text-sm text-red-600 text-center py-8">{error}</p>}
        {!loading && !error && <LeaderboardTable leaderboard={leaderboard} />}
      </main>
    </div>
  );
};

export default Leaderboard;
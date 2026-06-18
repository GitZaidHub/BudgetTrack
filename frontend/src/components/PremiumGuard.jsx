import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PremiumGuard = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    );
  }

  if (!user?.isPremium) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PremiumGuard;
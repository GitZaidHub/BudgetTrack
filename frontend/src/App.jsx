import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import PremiumGuard from './components/PremiumGuard';
import Leaderboard from './pages/Leaderboard';
import ReportPage from './pages/ReportPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/signup"
          element={
            <GuestRoute>
              <SignUp />
            </GuestRoute>
          }
        />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <SignIn />
            </GuestRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
  path="/leaderboard"
  element={
    <ProtectedRoute>
      <PremiumGuard>
        <Leaderboard />
      </PremiumGuard>
    </ProtectedRoute>
  }
/>
<Route
  path="/report"
  element={
    <ProtectedRoute>
      <PremiumGuard>
        <ReportPage />
      </PremiumGuard>
    </ProtectedRoute>
  }
/>
<Route
  path="/forgot-password"
  element={
    <GuestRoute>
      <ForgotPassword />
    </GuestRoute>
  }
/>
<Route
  path="/password/resetpassword/:id"
  element={
    <GuestRoute>
      <ResetPassword />
    </GuestRoute>
  }
/>

        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
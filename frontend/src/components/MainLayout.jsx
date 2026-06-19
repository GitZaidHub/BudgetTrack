import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  Trophy,
  Sparkles,
  LogOut,
  Menu,
  X,
  User,
  Crown
} from 'lucide-react';

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll to add active blur styles
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleExpensesClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/dashboard') {
      const el = document.getElementById('expenses-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      navigate('/dashboard', { state: { scrollToExpenses: true } });
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Expenses', path: '/dashboard#expenses', icon: Receipt, onClick: handleExpensesClick },
    { label: 'Reports', path: '/report', icon: BarChart3, premium: true },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy, premium: true },
    { label: 'Premium', path: '/premium', icon: Sparkles, highlight: !user?.isPremium },
  ];

  return (
    <div className="min-h-screen bg-bg-deep text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background Neon Glow Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] glow-orb-indigo rounded-full pointer-events-none animate-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] glow-orb-purple rounded-full pointer-events-none animate-float-delayed" />
      <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] glow-orb-indigo opacity-30 rounded-full pointer-events-none animate-float" />

      {/* Glass Sticky Navbar */}
      <nav
        className={`sticky top-0 z-40 w-full border-b border-glass transition-all duration-350 ${
          scrolled
            ? 'bg-bg-deep/75 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.4)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center gap-2 group">
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                  ₹
                </span>
                <span className="font-display font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                  AuraTrack
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/5 rounded-full p-1 backdrop-blur-sm">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isCurrent = item.path.startsWith('#')
                  ? location.pathname === '/dashboard' && location.hash === '#expenses'
                  : location.pathname === item.path;
                  
                // If it's a premium module and user is not premium, link leads to pricing page
                const targetPath = item.premium && !user?.isPremium ? '/premium' : item.path;

                return (
                  <Link
                    key={item.label}
                    to={targetPath}
                    onClick={item.onClick}
                    className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                      isCurrent
                        ? 'text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isCurrent && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>

                    {item.premium && !user?.isPremium && (
                      <span className="inline-block px-1 py-0.5 rounded text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold ml-1">
                        PRO
                      </span>
                    )}
                    
                    {item.highlight && (
                      <span className="flex h-1.5 w-1.5 relative ml-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Desktop User Section */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/5 border border-white/5 pl-2 pr-3 py-1.5 rounded-full backdrop-blur-sm">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                  {user?.isPremium ? (
                    <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-slate-300" />
                  )}
                </span>
                <span className="text-xs font-medium text-slate-300">
                  {user?.username}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full border border-glass bg-white/5 hover:bg-white/10 hover:border-white/15 text-slate-300 hover:text-white transition-all text-xs font-semibold cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>

            {/* Hamburger Button for Mobile */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="inline-flex items-center justify-center p-2 rounded-xl border border-glass bg-white/5 text-slate-400 hover:text-white focus:outline-none"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile slide-out navigation */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              {/* Backdrop Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 top-16 bg-black/60 backdrop-blur-sm z-30 md:hidden"
              />
              
              {/* Drawer Menu */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.25 }}
                className="fixed top-16 right-0 bottom-0 w-[280px] bg-bg-deep border-l border-glass p-6 z-40 md:hidden flex flex-col justify-between shadow-2xl"
              >
                <div className="space-y-6">
                  {/* User Profile */}
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-glass bg-white/5">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                      {user?.isPremium ? (
                        <Crown className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
                      ) : (
                        <User className="w-5 h-5 text-slate-300" />
                      )}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-none">
                        {user?.username}
                      </h4>
                      <p className="text-xs text-dim mt-1">
                        {user?.isPremium ? 'Premium Member' : 'Free Tier'}
                      </p>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="flex flex-col gap-2">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isCurrent = item.path.startsWith('#')
                        ? location.pathname === '/dashboard' && location.hash === '#expenses'
                        : location.pathname === item.path;
                      
                      const targetPath = item.premium && !user?.isPremium ? '/premium' : item.path;

                      return (
                        <Link
                          key={item.label}
                          to={targetPath}
                          onClick={(e) => {
                            if (item.onClick) item.onClick(e);
                            setMobileOpen(false);
                          }}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all text-sm font-semibold ${
                            isCurrent
                              ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/30 text-white'
                              : 'bg-white/5 border-transparent text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </div>
                          
                          {item.premium && !user?.isPremium && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] bg-indigo-500/25 border border-indigo-500/35 text-indigo-400 font-bold">
                              PRO
                            </span>
                          )}

                          {item.highlight && (
                            <span className="flex h-1.5 w-1.5 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-glass bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-400 hover:text-rose-300 transition-all font-semibold text-sm cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;

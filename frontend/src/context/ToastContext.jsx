import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Portal Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            let Icon = Info;
            let iconColor = 'text-cyan-400';
            let borderColor = 'border-cyan-500/20';
            let glowColor = 'shadow-cyan-500/10';

            if (toast.type === 'success') {
              Icon = CheckCircle2;
              iconColor = 'text-emerald-400';
              borderColor = 'border-emerald-500/20';
              glowColor = 'shadow-emerald-500/10';
            } else if (toast.type === 'error') {
              Icon = XCircle;
              iconColor = 'text-rose-400';
              borderColor = 'border-rose-500/20';
              glowColor = 'shadow-rose-500/10';
            } else if (toast.type === 'warning') {
              Icon = AlertTriangle;
              iconColor = 'text-amber-400';
              borderColor = 'border-amber-500/20';
              glowColor = 'shadow-amber-500/10';
            }

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl glass-panel ${borderColor} shadow-lg ${glowColor} border`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${iconColor} mt-0.5`} />
                <div className="flex-1 text-sm font-medium text-slate-200">
                  {toast.message}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-dim hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

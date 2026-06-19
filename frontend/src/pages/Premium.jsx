import { useState } from 'react';
import { load } from '@cashfreepayments/cashfree-js';
import { createPaymentOrder, verifyPayment } from '../api/paymentApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import {
  Sparkles,
  CheckCircle,
  ShieldCheck,
  Zap,
  Globe2,
  LockKeyhole,
  Check,
  Crown
} from 'lucide-react';
import { motion } from 'framer-motion';

const Premium = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [processing, setProcessing] = useState(false);

  const handleBuyPremium = async () => {
    setProcessing(true);
    try {
      const { data: orderData } = await createPaymentOrder();
      const { orderId, paymentSessionId } = orderData;

      const cashfree = await load({
        mode: import.meta.env.VITE_CASHFREE_ENV || 'sandbox',
      });

      // Opens checkout modal
      await cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_modal',
      });

      // Verification
      const { data: verifyData } = await verifyPayment(orderId);

      if (verifyData.success) {
        showToast('Membership upgraded successfully!', 'success');
        refreshUser();
      } else {
        showToast('Payment verification failed. Contact support.', 'error');
      }
    } catch (err) {
      showToast('Transaction was cancelled or failed.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const benefits = [
    { title: 'Expense Analytics', desc: 'Unlock detailed monthly timeline charts and category distribution splits.' },
    { title: 'Leaderboard Access', desc: 'Interact with community savings rankings and see how you stack up.' },
    { title: 'Advanced Reports', desc: 'Export formatted spreadsheets or printing-ready PDF summaries.' },
    { title: 'Future AI Insights', desc: 'Gain priority access to conversational budget auditing tools (Gemini).' },
  ];

  return (
    <div className="space-y-12 pb-16 pt-4 max-w-4xl mx-auto px-4 select-none">
      {/* Hero section */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold"
        >
          <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
          <span>PRO MEMBERSHIP</span>
        </motion.div>
        
        <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight text-white leading-tight">
          Unlock Premium features today
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-lg mx-auto">
          Upgrade your ledger tracking to access comparative boards, reports, and interactive charts.
        </p>
      </div>

      {user?.isPremium ? (
        /* ALREADY PREMIUM LAYOUT */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel border border-amber-500/20 bg-amber-500/[0.02] rounded-2xl p-8 max-w-xl mx-auto text-center space-y-6 relative overflow-hidden"
        >
          {/* Subtle gold grid overlay */}
          <div className="absolute top-0 inset-x-0 h-full bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.05)_0%,transparent_60%)] pointer-events-none" />

          <div className="flex flex-col items-center space-y-2">
            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-450 shadow-lg shadow-amber-500/5 animate-pulse">
              <Crown className="w-7 h-7 fill-amber-400" />
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">Active Membership</h3>
            <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">AuraTrack Champion Tier</p>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            You already have full, unrestricted access to the savings leaderboard, analytical reports, CSV tools, and Gemini categorization. Thank you for your support!
          </p>

          <div className="pt-4 border-t border-glass flex items-center justify-center gap-6 text-xs text-dim">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Activated account</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-450" />
              <span>Full SaaS access</span>
            </div>
          </div>
        </motion.div>
      ) : (
        /* PRICING GRID LAYOUT */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-3xl mx-auto">
          {/* Left Column: Core SaaS Features list */}
          <div className="flex flex-col justify-center space-y-6">
            <h3 className="text-lg font-bold text-white">What is included:</h3>
            <div className="space-y-4">
              {benefits.map((b) => (
                <div key={b.title} className="flex gap-3 items-start">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">{b.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Pricing Checkout Card with glowing pulsing border */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl glass-panel relative p-8 shadow-2xl flex flex-col justify-between space-y-6 border border-glass animate-pulse-glow"
          >
            {/* Header pill */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-dim tracking-wider uppercase">Unlimited Membership</span>
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase">
                Best value
              </span>
            </div>

            {/* Price Details */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold text-white font-sans tracking-tight">₹499</span>
                <span className="text-slate-450 text-xs font-semibold">/ lifetime access</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                One-time checkout fee. Pay once, use forever. No recurring credit card subscriptions.
              </p>
            </div>

            {/* Buy Action */}
            <div className="space-y-4 pt-4 border-t border-glass">
              <Button
                onClick={handleBuyPremium}
                loading={processing}
                fullWidth
              >
                ✨ Upgrade with Cashfree
              </Button>

              {/* Trust badges underneath */}
              <div className="flex flex-col gap-2 pt-2 text-[10px] text-dim font-medium">
                <div className="flex items-center gap-1.5">
                  <LockKeyhole className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Secure 256-bit SSL encrypted gateway</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Powered by Cashfree checkout integrations</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Premium;

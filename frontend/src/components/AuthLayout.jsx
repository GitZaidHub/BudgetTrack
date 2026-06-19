import { Crown, Sparkles, Shield, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthLayout = ({ title, subtitle, children, showBenefits = true }) => {
  const benefits = [
    {
      icon: Sparkles,
      title: 'Gemini AI Categorization',
      desc: 'Type descriptions naturally; our integrated Gemini AI instantly predicts and files categories.',
    },
    {
      icon: BarChart3,
      title: 'Advanced SaaS Reports',
      desc: 'Visualize your cash flows with interactive responsive charts and download spreadsheets or PDF reports.',
    },
    {
      icon: Crown,
      title: 'Competitive Leaderboards',
      desc: 'Engage with team trackers, rank by expenses, and identify saving champions in real time.',
    },
    {
      icon: Shield,
      title: 'Enterprise-Grade Security',
      desc: 'Your financial summaries are kept safe with JWT access controls and robust session protections.',
    },
  ];

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-bg-deep text-slate-100 font-sans relative overflow-hidden">
      {/* Background Glow Orbs for both split views */}
      <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] glow-orb-indigo rounded-full pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] glow-orb-purple rounded-full pointer-events-none" />

      {/* Left Branding/Benefits Section - Visible on Desktop */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-950/40 border-r border-glass relative overflow-hidden">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center gap-2.5 z-10">
          <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-extrabold text-xl shadow-lg shadow-indigo-500/25">
            ₹
          </span>
          <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            AuraTrack
          </span>
        </div>

        {/* Dynamic Marketing Slides / Benefits */}
        <div className="my-auto max-w-lg z-10 space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl font-display font-extrabold tracking-tight text-white leading-tight">
              Track wealth in the <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">next dimension</span>.
            </h2>
            <p className="text-slate-400 text-sm">
              Say goodbye to tedious manual ledger tracking. AuraTrack merges standard billing APIs with conversational AI classification.
            </p>
          </div>

          <div className="space-y-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: -25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                  className="flex gap-4 items-start"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-glass text-indigo-400 shrink-0">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{benefit.title}</h4>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">{benefit.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom footer text */}
        <div className="text-xs text-dim z-10">
          &copy; {new Date().getFullYear()} AuraTrack. Created for modern digital-native startups.
        </div>
      </div>

      {/* Right Form Container Section */}
      <div className="flex flex-col justify-center items-center px-6 py-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile Logo Header */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-extrabold text-2xl shadow-md mb-3">
              ₹
            </div>
            <h2 className="font-display font-extrabold text-2xl tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              AuraTrack
            </h2>
          </div>

          {/* Form Box wrapped in glass card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full glass-panel border border-glass rounded-2xl p-8 shadow-2xl relative"
          >
            {/* Ambient inner glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent rounded-2xl pointer-events-none" />
            
            <div className="mb-6 space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
              {subtitle && <p className="text-slate-400 text-xs">{subtitle}</p>}
            </div>

            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
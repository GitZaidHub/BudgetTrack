import { Inbox } from 'lucide-react';

const EmptyState = ({
  title = 'No transactions yet',
  subtitle = 'Start tracking your spending using the form.',
  icon: Icon = Inbox
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 space-y-3">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-glass text-slate-500 shadow-inner">
        <Icon className="w-5.5 h-5.5" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-slate-200">{title}</h3>
        <p className="text-xs text-dim max-w-[280px] leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
};

export default EmptyState;
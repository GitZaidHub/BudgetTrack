import { Crown } from 'lucide-react';

const PremiumBanner = () => (
  <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20 text-amber-400 text-center text-xs font-semibold py-2.5 rounded-2xl flex items-center justify-center gap-1.5 shadow-lg select-none">
    <Crown className="w-4 h-4 fill-amber-450 animate-pulse text-amber-450" />
    <span>Active Membership: You are a Premium member. Enjoy exclusive reports and leaderboards!</span>
  </div>
);

export default PremiumBanner;
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  loading = false,
  fullWidth = false,
  type = 'button',
  variant = 'primary',
  onClick,
  ...rest
}) => {
  const base =
    'inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold ' +
    'tracking-wide shadow-lg transition-all duration-200 focus:outline-none ' +
    'disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]';

  const variants = {
    primary:
      'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600 ' +
      'focus:ring-2 focus:ring-blue-600/30 shadow-blue-600/15 hover:shadow-blue-600/25 hover:scale-[1.01]',
    secondary:
      'bg-white/5 text-slate-200 border border-glass hover:bg-white/8 hover:text-white ' +
      'focus:ring-2 focus:ring-white/10 hover:scale-[1.01]',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''}`}
      {...rest}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
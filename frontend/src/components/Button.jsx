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
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold ' +
    'shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ' +
    'disabled:opacity-60 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500',
    secondary:
      'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''}`}
      {...rest}
    >
      {loading ? 'Please wait…' : children}
    </button>
  );
};

export default Button;
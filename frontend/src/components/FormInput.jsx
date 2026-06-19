import { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const FormInput = ({ label, name, type = 'text', value, onChange, error, ...rest }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  const inputType = isPasswordField ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full space-y-1.5">
      <div className="flex justify-between items-center">
        <label htmlFor={name} className="block text-xs font-semibold tracking-wider text-slate-300 uppercase">
          {label}
        </label>
        {error && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-red-400 animate-fade-in">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </span>
        )}
      </div>

      <div className="relative rounded-xl shadow-sm">
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          aria-invalid={!!error}
          className={`block w-full rounded-xl px-4 py-3 text-sm transition-all duration-200 glass-input ${
            error
              ? 'border-red-600/40 focus:border-red-600 focus:ring-2 focus:ring-red-600/20'
              : 'border-white/8 focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/10'
          }`}
          {...rest}
        />

        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-dim hover:text-slate-200 transition-colors focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default FormInput;
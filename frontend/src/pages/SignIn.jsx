import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AuthLayout from '../components/AuthLayout';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { Lock, Mail } from 'lucide-react';

const initialForm = { email: '', password: '' };

const validate = (form) => {
  const errors = {};

  if (!form.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!form.password) {
    errors.password = 'Password is required';
  }

  return errors;
};

const SignIn = () => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect target after login
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast('Please correct the errors in the form', 'warning');
      return;
    }

    setSubmitting(true);
    setServerError('');

    try {
      await login(form.email.trim(), form.password);
      
      // If remember me is checked, set a flag (logical UI flag)
      if (rememberMe) {
        localStorage.setItem('remember_session', 'true');
      } else {
        localStorage.removeItem('remember_session');
      }

      showToast('Logged in successfully!', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      let msg = 'Something went wrong. Please try again.';
      if (err.response?.status === 401) {
        msg = 'Invalid email or password.';
      } else if (err.response?.status === 422) {
        msg = 'Please check your email and password.';
      }
      setServerError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue tracking your expenses."
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <FormInput
          label="Email Address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
          placeholder="you@example.com"
        />

        <FormInput
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
          placeholder="Your password"
        />

        {/* Remember Session & Forgot Password Actions */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 text-slate-300 font-medium cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-glass bg-white/5 text-indigo-500 focus:ring-indigo-500/20 focus:ring-offset-0 focus:outline-none transition-colors"
            />
            <span>Remember session</span>
          </label>
          
          <Link
            to="/forgot-password"
            className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {serverError && (
          <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 animate-fade-in font-medium">
            {serverError}
          </p>
        )}

        <Button type="submit" loading={submitting} fullWidth>
          Sign in to Account
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-dim font-medium">
        Don't have an account?{' '}
        <Link
          to="/signup"
          className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors ml-1"
        >
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
};

export default SignIn;
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AuthLayout from '../components/AuthLayout';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { Check, X } from 'lucide-react';

const initialForm = { username: '', email: '', password: '' };

const validate = (form) => {
  const errors = {};

  if (!form.username.trim()) {
    errors.username = 'Username is required';
  } else if (form.username.length < 3 || form.username.length > 30) {
    errors.username = 'Username must be between 3 and 30 characters';
  } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
    errors.username = 'Only letters, numbers, and underscores allowed';
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!form.password) {
    errors.password = 'Password is required';
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (!/\d/.test(form.password)) {
    errors.password = 'Password must contain at least one number';
  }

  return errors;
};

const SignUp = () => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

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
      showToast('Please correct the validation errors', 'warning');
      return;
    }

    setSubmitting(true);
    setServerError('');

    try {
      await signup(form.username.trim(), form.email.trim(), form.password);
      setSuccessMessage('Account created. Redirecting to sign in…');
      showToast('Account created successfully!', 'success');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      const apiError = err.response?.data?.error;

      let msg = 'Something went wrong. Please try again.';
      if (err.response?.status === 409) {
        msg = 'An account with this email already exists.';
      } else if (err.response?.status === 422 && apiError?.details) {
        const fieldErrors = {};
        apiError.details.forEach((d) => {
          fieldErrors[d.field] = d.message;
        });
        setErrors(fieldErrors);
        msg = 'Please correct the errors in the form.';
      }
      setServerError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Real-time password strength check
  const hasMinLength = form.password.length >= 8;
  const hasNumber = /\d/.test(form.password);

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Track every expense, automatically categorized by AI."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormInput
          label="Username"
          name="username"
          value={form.username}
          onChange={handleChange}
          error={errors.username}
          autoComplete="username"
          placeholder="zaidkhan"
        />

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
          autoComplete="new-password"
          placeholder="Choose a strong password"
        />

        {/* Real-time Password Strength Criteria Panel */}
        <div className="bg-white/5 border border-glass rounded-xl p-3 space-y-2 text-xs">
          <p className="font-semibold text-slate-300">Password requirements:</p>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className={`flex items-center justify-center w-4 h-4 rounded-full border ${
                hasMinLength
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-white/5 border-glass text-dim'
              }`}>
                {hasMinLength ? <Check className="w-2.5 h-2.5" /> : <span className="w-1 h-1 rounded-full bg-slate-400" />}
              </span>
              <span className={hasMinLength ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
                Minimum 8 characters
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`flex items-center justify-center w-4 h-4 rounded-full border ${
                hasNumber
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-white/5 border-glass text-dim'
              }`}>
                {hasNumber ? <Check className="w-2.5 h-2.5" /> : <span className="w-1 h-1 rounded-full bg-slate-400" />}
              </span>
              <span className={hasNumber ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
                At least one digit (0-9)
              </span>
            </div>
          </div>
        </div>

        {serverError && (
          <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 animate-fade-in font-medium">
            {serverError}
          </p>
        )}

        {successMessage && (
          <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 animate-fade-in font-medium">
            {successMessage}
          </p>
        )}

        <Button type="submit" loading={submitting} fullWidth>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-dim font-medium">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors ml-1"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default SignUp;
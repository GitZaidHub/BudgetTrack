import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../api/passwordApi';
import { useToast } from '../context/ToastContext';
import AuthLayout from '../components/AuthLayout';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { ShieldAlert, ArrowLeft, MailCheck } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address');
      showToast('Please enter a valid email address', 'warning');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await requestPasswordReset(email.trim());
      setSubmitted(true);
      showToast('Reset link dispatched successfully!', 'success');
    } catch {
      const msg = 'Something went wrong. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout title="Check your inbox">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <MailCheck className="w-6 h-6 animate-bounce" />
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            If an account exists with <span className="font-semibold text-white">{email}</span>, we have dispatched a password reset link. The link expires in <span className="font-semibold text-white">30 minutes</span>.
          </p>
          <div className="w-full pt-4 border-t border-glass flex items-center justify-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to sign in
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a recovery link."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormInput
          label="Email Address"
          name="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          error={error}
          autoComplete="email"
          placeholder="you@example.com"
        />

        {/* Security Warning Information */}
        <div className="flex gap-2.5 p-3 rounded-xl border border-glass bg-white/5 text-[11px] text-slate-400">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            For security, resetting your password clears any current sessions. Make sure you use a device you own.
          </p>
        </div>

        <Button type="submit" loading={submitting} fullWidth>
          Send recovery link
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-dim hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
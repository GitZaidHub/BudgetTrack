import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { checkResetLink, submitNewPassword } from '../api/passwordApi';
import { useToast } from '../context/ToastContext';
import AuthLayout from '../components/AuthLayout';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { ShieldAlert, Check, ShieldCheck, Loader2 } from 'lucide-react';

const ResetPassword = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [linkStatus, setLinkStatus] = useState('checking'); // 'checking' | 'valid' | 'invalid'
  const [linkError, setLinkError] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyLink = async () => {
      try {
        await checkResetLink(id);
        setLinkStatus('valid');
      } catch (err) {
        setLinkStatus('invalid');
        const msg = err.response?.data?.error?.message || 'This reset link is invalid or has expired.';
        setLinkError(msg);
        showToast(msg, 'error');
      }
    };

    verifyLink();
  }, [id]);

  const validate = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/\d/.test(password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast('Please correct validation requirements', 'warning');
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      await submitNewPassword(id, password);
      setSuccess(true);
      showToast('Password updated successfully!', 'success');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Something went wrong. Please try again.';
      setErrors({ form: message });
      showToast(message, 'error');

      if (err.response?.status === 400) {
        setLinkStatus('invalid');
        setLinkError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Real-time password strength check
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);

  if (linkStatus === 'checking') {
    return (
      <AuthLayout title="Checking link validity">
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm text-slate-400">Verifying security token...</p>
        </div>
      </AuthLayout>
    );
  }

  if (linkStatus === 'invalid') {
    return (
      <AuthLayout title="Link expired or invalid">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{linkError}</p>
          <div className="w-full pt-4 border-t border-glass flex items-center justify-center">
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Request a new reset link
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout title="Password changed">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-6 h-6 animate-bounce" />
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Your password has been securely updated. Redirecting you to sign in...
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset your password">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormInput
          label="New Password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors((prev) => ({ ...prev, password: undefined, form: undefined }));
          }}
          error={errors.password}
          autoComplete="new-password"
          placeholder="At least 8 characters, 1 number"
        />

        <FormInput
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setErrors((prev) => ({ ...prev, confirmPassword: undefined, form: undefined }));
          }}
          error={errors.confirmPassword}
          autoComplete="new-password"
          placeholder="Re-enter your new password"
        />

        {/* Password Requirements Checklist */}
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

        {errors.form && (
          <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 animate-fade-in font-medium">
            {errors.form}
          </p>
        )}

        <Button type="submit" loading={submitting} fullWidth>
          Change password
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { checkResetLink, submitNewPassword } from '../api/passwordApi';
import AuthLayout from '../components/AuthLayout';
import FormInput from '../components/FormInput';
import Button from '../components/Button';

const ResetPassword = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
        setLinkError(
          err.response?.data?.error?.message || 'This reset link is invalid or has expired.'
        );
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
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      await submitNewPassword(id, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      const message =
        err.response?.data?.error?.message || 'Something went wrong. Please try again.';
      setErrors({ form: message });

      // If the backend now says the link is invalid/expired (e.g., it
      // expired in the few seconds between page load and submission),
      // reflect that by switching to the invalid-link view too.
      if (err.response?.status === 400) {
        setLinkStatus('invalid');
        setLinkError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (linkStatus === 'checking') {
    return (
      <AuthLayout title="Checking your link…">
        <p className="text-sm text-gray-500 text-center">Please wait a moment.</p>
      </AuthLayout>
    );
  }

  if (linkStatus === 'invalid') {
    return (
      <AuthLayout title="Link no longer valid">
        <p className="text-sm text-gray-600 text-center">{linkError}</p>
        <p className="mt-6 text-center text-sm">
          <Link
            to="/forgot-password"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Request a new link
          </Link>
        </p>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout title="Password updated">
        <p className="text-sm text-gray-600 text-center">
          Your password has been changed. Redirecting you to sign in…
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set a new password">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormInput
          label="New password"
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
          label="Confirm new password"
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

        {errors.form && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {errors.form}
          </p>
        )}

        <Button type="submit" loading={submitting} fullWidth>
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
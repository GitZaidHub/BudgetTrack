import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../api/passwordApi';
import AuthLayout from '../components/AuthLayout';
import FormInput from '../components/FormInput';
import Button from '../components/Button';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await requestPasswordReset(email.trim());
      // Always show the same success state — the backend's response
      // is intentionally generic, and the UI respects that by not
      // trying to infer anything from the response shape either.
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout title="Check your email">
        <p className="text-sm text-gray-600 text-center">
          If an account with that email exists, we've sent a password reset link. The link
          expires in 30 minutes.
        </p>
        <p className="mt-6 text-center text-sm">
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Back to sign in
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormInput
          label="Email"
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

        <Button type="submit" loading={submitting} fullWidth>
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Remembered your password?{' '}
        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPassword;
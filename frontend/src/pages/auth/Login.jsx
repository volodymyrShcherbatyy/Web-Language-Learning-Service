import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthCard from '../../components/AuthCard';
import { login } from '../../services/api';
import { getProfile } from '../../services/profileApi';
import useLocalization from '../../hooks/useLocalization';
import { getToken, setToken } from '../../utils/storage';

const Login = () => {
  const navigate = useNavigate();
  const { t } = useLocalization();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (getToken()) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await login({ email, password });
      const authToken = response?.token || response?.access_token;
      if (!authToken) {
        throw new Error(t('login_error'));
      }
      setToken(authToken);
      const profile = await getProfile();
      const isComplete = Boolean(
        profile?.native_language_id && profile?.learning_language_id && profile?.interface_language_id
      );
      navigate(isComplete ? '/dashboard' : '/onboarding', { replace: true });
    } catch (submitError) {
      setError(submitError.message || t('login_error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <AuthCard title={t('login_title')}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="email">
              {t('email')}
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="password">
              {t('password')}
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? t('logging_in') : t('login')}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          {t('need_account')}{' '}
          <Link className="font-semibold text-blue-600 hover:text-blue-700" to="/register">
            {t('register')}
          </Link>
        </p>
      </AuthCard>
    </div>
  );
};

export default Login;

import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import Onboarding from './pages/profile/Onboarding';
import ProfileSettings from './pages/profile/ProfileSettings';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Lesson from './pages/Lesson';
import LessonSummary from './pages/LessonSummary';
import { getProfile } from './services/profileApi';
import useLocalization from './hooks/useLocalization';
import { getToken, removeToken } from './utils/storage';

const Dashboard = () => {
  const { t } = useLocalization();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-100 px-4">
      <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard')}</h1>
        <p className="mt-2 text-gray-600">{t('dashboard_subtitle')}</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/lesson"
            className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white transition hover:bg-indigo-700"
          >
            {t('start_lesson')}
          </Link>
          <Link
            to="/profile/settings"
            className="rounded-lg border border-gray-300 px-5 py-2 font-semibold text-gray-800 transition hover:bg-gray-50"
          >
            {t('edit_profile_settings')}
          </Link>
          <button
            type="button"
            className="rounded-lg bg-gray-800 px-5 py-2 font-semibold text-white transition hover:bg-gray-900"
            onClick={() => {
              removeToken();
              window.location.href = '/login';
            }}
          >
            {t('log_out')}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const ProfileCompletionRoute = ({ requiresComplete, children }) => {
  const { t } = useLocalization();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let mounted = true;

    const checkProfile = async () => {
      try {
        const profile = await getProfile();
        if (!mounted) {
          return;
        }

        const isComplete = Boolean(
          profile?.native_language_id && profile?.learning_language_id && profile?.interface_language_id
        );

        if (requiresComplete && !isComplete) {
          setStatus('redirect_onboarding');
          return;
        }

        if (!requiresComplete && isComplete) {
          setStatus('redirect_dashboard');
          return;
        }

        setStatus('ready');
      } catch {
        if (mounted) {
          setStatus('ready');
        }
      }
    };

    checkProfile();

    return () => {
      mounted = false;
    };
  }, [requiresComplete]);

  if (status === 'loading') {
    return <div className="p-6 text-center text-gray-600">{t('loading')}</div>;
  }

  if (status === 'redirect_onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (status === 'redirect_dashboard') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route
      path="/onboarding"
      element={
        <ProtectedRoute>
          <ProfileCompletionRoute requiresComplete={false}>
            <Onboarding />
          </ProfileCompletionRoute>
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <ProfileCompletionRoute requiresComplete>
            <Dashboard />
          </ProfileCompletionRoute>
        </ProtectedRoute>
      }
    />
    <Route
      path="/lesson"
      element={
        <ProtectedRoute>
          <ProfileCompletionRoute requiresComplete>
            <Lesson />
          </ProfileCompletionRoute>
        </ProtectedRoute>
      }
    />
    <Route
      path="/lesson/summary"
      element={
        <ProtectedRoute>
          <ProfileCompletionRoute requiresComplete>
            <LessonSummary />
          </ProfileCompletionRoute>
        </ProtectedRoute>
      }
    />
    <Route
      path="/profile/settings"
      element={
        <ProtectedRoute>
          <ProfileSettings />
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default App;

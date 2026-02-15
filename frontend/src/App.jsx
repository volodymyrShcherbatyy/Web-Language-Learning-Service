import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { getToken, removeToken } from './utils/storage';

const Dashboard = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-100 px-4">
    <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-gray-600">You are successfully authenticated.</p>
      <button
        type="button"
        className="mt-5 rounded-lg bg-gray-800 px-5 py-2 font-semibold text-white transition hover:bg-gray-900"
        onClick={() => {
          removeToken();
          window.location.href = '/login';
        }}
      >
        Log out
      </button>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default App;

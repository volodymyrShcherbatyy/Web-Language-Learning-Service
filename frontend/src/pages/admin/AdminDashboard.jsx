import { useEffect, useState } from 'react';
import { ApiError, getAdminStats } from '../../services/adminApi';

const AdminDashboard = ({ onForbidden }) => {
  const [stats, setStats] = useState({ totalConcepts: 0, totalTranslations: 0, totalMedia: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      try {
        const data = await getAdminStats();
        if (mounted) {
          setStats(data);
        }
      } catch (loadError) {
        if (loadError instanceof ApiError && loadError.status === 403) {
          onForbidden();
          return;
        }

        if (mounted) {
          setError(loadError.message);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      mounted = false;
    };
  }, [onForbidden]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'Total concepts', value: stats.totalConcepts },
          { label: 'Total translations', value: stats.totalTranslations },
          { label: 'Total media files', value: stats.totalMedia },
        ].map((card) => (
          <div key={card.label} className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{isLoading ? '...' : card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;

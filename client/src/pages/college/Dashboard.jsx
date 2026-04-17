import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { ClipboardList, BarChart3 } from 'lucide-react';
import api from '../../services/api';
import Spinner from '../../components/common/Spinner';

export default function CollegeDashboard() {
  const { user } = useSelector((s) => s.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    const fmt = (d) => d.toISOString().split('T')[0];

    Promise.all([
      api.get('/college/applications', { params: { limit: 1 } }),
      api.get('/college/applications', { params: { limit: 1, start_date: fmt(startOfWeek), end_date: fmt(endOfWeek) } }),
    ])
      .then(([all, week]) => setStats({
        total: all.data.pagination?.total || 0,
        thisWeek: week.data.pagination?.total || 0,
      }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">College Staff Dashboard</h1>
          <p className="text-gray-500 text-sm">{user?.college?.college_name || 'Your College'}</p>
        </div>

        {loading ? <Spinner /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card text-center">
              <p className="text-4xl font-bold text-primary mb-1">{stats?.total || 0}</p>
              <p className="text-gray-500 text-sm">Total Applications Received</p>
            </div>
            <div className="card text-center">
              <p className="text-4xl font-bold text-amber-500 mb-1">{stats?.thisWeek ?? 0}</p>
              <p className="text-gray-500 text-sm">Applications This Week</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/college/applications" className="card hover:shadow-md transition-shadow flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <ClipboardList size={22} className="text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">View Applications</p>
              <p className="text-sm text-gray-500">Browse and filter received applications</p>
            </div>
          </Link>
          <Link to="/college/reports" className="card hover:shadow-md transition-shadow flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <BarChart3 size={22} className="text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Generate Reports</p>
              <p className="text-sm text-gray-500">Download gender, community & date-wise PDFs</p>
            </div>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}

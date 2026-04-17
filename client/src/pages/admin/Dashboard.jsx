import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileText, Clock, CheckCircle, Award } from 'lucide-react';
import api from '../../services/api';
import Spinner from '../../components/common/Spinner';

const COLORS = ['#1e3a5f', '#f59e0b', '#10b981', '#e74c3c', '#8b5cf6', '#06b6d4'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard/stats').then((r) => setStats(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <AppLayout><Spinner size="lg" className="py-32" /></AppLayout>;

  const counters = stats?.counters || {};
  const genderData = (stats?.genderStats || []).map((g) => ({ name: g.gender, value: parseInt(g.count) }));
  const admissionData = (stats?.admissionStats || []).map((a) => ({ name: a.admission_type?.replace('_', ' '), value: parseInt(a.count) }));

  const cards = [
    { label: 'Total Applications', value: counters.totalApps || 0, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Payment', value: counters.pendingPayments || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Verified', value: counters.verified || 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Allocated', value: counters.allocated || 0, icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Academic Year: {stats?.activeYear?.year_label || 'N/A'}</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon size={22} className={color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">Applications by Gender</h3>
            {genderData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {genderData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-400 text-sm text-center py-8">No data yet</p>}
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">Applications by Admission Type</h3>
            {admissionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={admissionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-400 text-sm text-center py-8">No data yet</p>}
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Manage Colleges', href: '/admin/colleges', color: 'bg-blue-600' },
            { label: 'Manage Users', href: '/admin/users', color: 'bg-green-600' },
            { label: 'Master Data', href: '/admin/master-data', color: 'bg-amber-600' },
            { label: 'Reports', href: '/admin/reports', color: 'bg-purple-600' },
          ].map(({ label, href, color }) => (
            <a key={href} href={href} className={`${color} text-white rounded-lg p-4 text-center text-sm font-medium hover:opacity-90 transition-opacity`}>{label}</a>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

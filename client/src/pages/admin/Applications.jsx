import { useEffect, useState, useCallback } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUSES = ['DRAFT', 'SUBMITTED', 'PAID', 'VERIFIED', 'ALLOCATED', 'REJECTED'];
const UPDATABLE = ['VERIFIED', 'ALLOCATED', 'REJECTED'];

export default function AdminApplications() {
  const [apps, setApps] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ status: '', gender: '', search: '', page: 1, limit: 20 });
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [error, setError] = useState('');

  const upd = (k, v) => setFilters((p) => ({ ...p, [k]: v, page: 1 }));

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
    api.get('/admin/applications', { params })
      .then((r) => { setApps(r.data.data || []); setPagination(r.data.pagination); })
      .catch(() => setError('Failed to load applications'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const openDetail = (app) => {
    setSelected(app);
    setNewStatus(app.status);
  };

  const handleStatusUpdate = async () => {
    if (!selected || newStatus === selected.status) return;
    setUpdating(true);
    try {
      await api.patch(`/admin/applications/${selected.application_id}/status`, { status: newStatus });
      setApps((prev) => prev.map((a) => a.application_id === selected.application_id ? { ...a, status: newStatus } : a));
      setSelected(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
    setUpdating(false);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Applications</h1>

        {/* Filters */}
        <div className="card flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <label className="form-label text-xs">Search (name / mobile)</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="form-input text-sm pl-8"
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => upd('search', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="form-label text-xs">Status</label>
            <select className="form-select text-sm" value={filters.status} onChange={(e) => upd('status', e.target.value)}>
              <option value="">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label text-xs">Gender</label>
            <select className="form-select text-sm" value={filters.gender} onChange={(e) => upd('gender', e.target.value)}>
              <option value="">All Genders</option>
              {['MALE', 'FEMALE', 'OTHER'].map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <button onClick={load} className="btn-primary text-sm flex items-center gap-1">
            <Search size={14} /> Filter
          </button>
          {pagination && (
            <span className="self-center text-sm text-gray-500 ml-auto">
              {pagination.total} application{pagination.total !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

        {/* Table */}
        <div className="card !p-0 overflow-hidden">
          {loading ? (
            <Spinner size="md" className="py-16" />
          ) : apps.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">No applications found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['App No.', 'Student', 'Gender', 'Community', 'District', 'Type', 'Status', 'Payment', 'Date', ''].map((h) => (
                      <th key={h} className="text-left px-3 py-3 text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {apps.map((app) => (
                    <tr key={app.application_id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono text-xs">{app.application_no || '—'}</td>
                      <td className="px-3 py-2 font-medium max-w-32 truncate">{app.student?.name || '—'}</td>
                      <td className="px-3 py-2 text-xs">{app.student?.gender || '—'}</td>
                      <td className="px-3 py-2 text-xs">{app.student?.community?.community_name || '—'}</td>
                      <td className="px-3 py-2 text-xs">{app.student?.commDistrict?.district_name || '—'}</td>
                      <td className="px-3 py-2 text-xs">{app.student?.admission_type?.replace('_', ' ') || '—'}</td>
                      <td className="px-3 py-2"><StatusBadge status={app.status} /></td>
                      <td className="px-3 py-2 text-xs">
                        {app.payments?.[0] ? <StatusBadge status={app.payments[0].status} /> : '—'}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(app.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => openDetail(app)}
                          className="text-xs text-primary underline hover:no-underline"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                className="btn-secondary text-sm flex items-center gap-1 disabled:opacity-50"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                className="btn-secondary text-sm flex items-center gap-1 disabled:opacity-50"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Manage Application">
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Application No.', selected.application_no],
                ['Student', selected.student?.name],
                ['Current Status', selected.status],
                ['Academic Year', selected.academicYear?.year_label],
              ].map(([l, v]) => (
                <div key={l}>
                  <span className="text-xs font-medium text-gray-500 uppercase">{l}</span>
                  <p className="font-medium text-gray-800 mt-0.5">{v || '—'}</p>
                </div>
              ))}
            </div>

            <div>
              <label className="form-label">Update Status</label>
              <select
                className="form-select"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s} disabled={!UPDATABLE.includes(s) && s !== selected.status}>
                    {s}{!UPDATABLE.includes(s) && s !== selected.status ? ' (read-only)' : ''}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Updatable statuses: VERIFIED, ALLOCATED, REJECTED
              </p>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setSelected(null)} className="btn-secondary text-sm">Cancel</button>
              <button
                onClick={handleStatusUpdate}
                disabled={updating || newStatus === selected.status || !UPDATABLE.includes(newStatus)}
                className="btn-primary text-sm disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}

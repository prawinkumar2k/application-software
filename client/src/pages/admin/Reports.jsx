import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import api from '../../services/api';
import { Search, Download } from 'lucide-react';

export default function AdminReports() {
  const [filters, setFilters] = useState({ start_date: '', end_date: '', status: '', gender: '', page: 1, limit: 50 });
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [tab, setTab] = useState('applications');
  const [error, setError] = useState('');

  const upd = (k, v) => setFilters((p) => ({ ...p, [k]: v }));

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = tab === 'applications' ? '/admin/reports/applications' : '/admin/reports/payments';
      const res = await api.get(endpoint, { params: filters });
      setData(res.data.data || []);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch report');
      setData([]);
    }
    setLoading(false);
  };

  const downloadReport = async () => {
    setDownloading(true);
    setError('');
    try {
      const endpoint = tab === 'applications' ? '/admin/reports/applications/download' : '/admin/reports/payments/download';
      const res = await api.get(endpoint, { params: filters, responseType: 'blob' });

      const contentType = res.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        const text = await res.data.text();
        const json = JSON.parse(text);
        setError(json.message || 'No data found');
        setDownloading(false);
        return;
      }

      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tab}_report_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      if (err.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          const json = JSON.parse(text);
          setError(json.message || 'Failed to download report');
        } catch {
          setError('Failed to download report');
        }
      } else {
        setError(err.response?.data?.message || 'Failed to download report');
      }
    }
    setDownloading(false);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Reports</h1>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          {['applications', 'payments'].map((t) => (
            <button key={t} onClick={() => { setTab(t); setData([]); setError(''); }}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="form-label text-xs">Start Date</label>
              <input className="form-input text-sm" type="date" value={filters.start_date} onChange={(e) => upd('start_date', e.target.value)} />
            </div>
            <div>
              <label className="form-label text-xs">End Date</label>
              <input className="form-input text-sm" type="date" value={filters.end_date} onChange={(e) => upd('end_date', e.target.value)} />
            </div>
            {tab === 'applications' && (
              <>
                <div>
                  <label className="form-label text-xs">Status</label>
                  <select className="form-select text-sm" value={filters.status} onChange={(e) => upd('status', e.target.value)}>
                    <option value="">All Statuses</option>
                    {['DRAFT','SUBMITTED','PAID','VERIFIED','ALLOCATED','REJECTED'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label text-xs">Gender</label>
                  <select className="form-select text-sm" value={filters.gender} onChange={(e) => upd('gender', e.target.value)}>
                    <option value="">All Genders</option>
                    {['MALE','FEMALE','OTHER'].map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </>
            )}
            {tab === 'payments' && (
              <div>
                <label className="form-label text-xs">Payment Status</label>
                <select className="form-select text-sm" value={filters.status} onChange={(e) => upd('status', e.target.value)}>
                  <option value="">All</option>
                  {['PENDING','SUCCESS','FAILED','ABORTED'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 mt-4">
            <button onClick={fetchReport} disabled={loading} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60">
              <Search size={14} /> Generate Report
            </button>
            <button onClick={downloadReport} disabled={downloading} className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-60">
              <Download size={14} /> {downloading ? 'Downloading...' : 'Download CSV'}
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? <Spinner size="md" className="py-12" /> : data.length > 0 && (
          <div className="card !p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="text-sm text-gray-600">Showing {data.length} of {pagination?.total} records</span>
            </div>
            <div className="overflow-x-auto">
              {tab === 'applications' ? (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50"><tr>{['App No.', 'Student', 'Gender', 'Community', 'District', 'Type', 'Status', 'Date'].map((h) => <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-gray-600">{h}</th>)}</tr></thead>
                  <tbody className="divide-y">
                    {data.map((app) => (
                      <tr key={app.application_id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-mono text-xs">{app.application_no}</td>
                        <td className="px-3 py-2">{app.student?.name}</td>
                        <td className="px-3 py-2">{app.student?.gender}</td>
                        <td className="px-3 py-2">{app.student?.community?.community_name}</td>
                        <td className="px-3 py-2">{app.student?.commDistrict?.district_name}</td>
                        <td className="px-3 py-2 text-xs">{app.student?.admission_type}</td>
                        <td className="px-3 py-2"><StatusBadge status={app.status} /></td>
                        <td className="px-3 py-2 text-xs text-gray-500">{new Date(app.created_at).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50"><tr>{['Order ID', 'App No.', 'Amount', 'Status', 'Mode', 'Date'].map((h) => <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-gray-600">{h}</th>)}</tr></thead>
                  <tbody className="divide-y">
                    {data.map((p) => (
                      <tr key={p.payment_id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-mono text-xs">{p.order_id}</td>
                        <td className="px-3 py-2 text-xs">{p.application?.application_no}</td>
                        <td className="px-3 py-2 font-semibold">Rs.{p.amount}</td>
                        <td className="px-3 py-2"><StatusBadge status={p.status} /></td>
                        <td className="px-3 py-2 text-xs">{p.payment_mode || '-'}</td>
                        <td className="px-3 py-2 text-xs text-gray-500">{new Date(p.created_at).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

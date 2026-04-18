import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import api from '../../services/api';
import { Search, Eye } from 'lucide-react';

export default function CollegeApplications() {
  const [apps, setApps] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ gender: '', hostel: '', status: '', page: 1, limit: 20 });
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const upd = (k, v) => setFilters((p) => ({ ...p, [k]: v, page: 1 }));

  const load = () => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    api.get('/college/applications', { params })
      .then((r) => { setApps(r.data.data || []); setPagination(r.data.pagination); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filters]);

  const viewDetail = async (id) => {
    try {
      const res = await api.get(`/college/applications/${id}`);
      setSelected(res.data.data);
      setShowDetail(true);
    } catch {}
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Received Applications</h1>

        {/* Filters */}
        <div className="card flex flex-wrap gap-3">
          <select className="form-select text-sm w-36" value={filters.gender} onChange={(e) => upd('gender', e.target.value)}>
            <option value="">All Genders</option>
            {['MALE','FEMALE','OTHER'].map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <select className="form-select text-sm w-36" value={filters.status} onChange={(e) => upd('status', e.target.value)}>
            <option value="">All Statuses</option>
            {['SUBMITTED','PAID','VERIFIED','ALLOCATED'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="form-select text-sm w-40" value={filters.hostel} onChange={(e) => upd('hostel', e.target.value)}>
            <option value="">All (Hostel)</option>
            <option value="true">Hostel Required</option>
          </select>
          <button onClick={load} className="btn-primary text-sm flex items-center gap-1"><Search size={14} /> Filter</button>
          {pagination && <span className="self-center text-sm text-gray-600 ml-auto font-medium">Total: {pagination.total} applications</span>}
        </div>

        {/* Table */}
        <div className="card !p-0 overflow-hidden">
          {loading ? <Spinner size="md" className="py-12" /> : apps.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500 text-base mb-2">No applications received yet</p>
              <p className="text-gray-400 text-sm">Applications will appear here once students submit their forms</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>{['App No.', 'Name', 'Gender', 'Community', 'Admission Type', 'Hostel', 'Status', 'Date', ''].map((h) => <th key={h} className="text-left px-3 py-3 text-xs font-semibold text-gray-600 uppercase">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y">
                  {apps.map((app) => (
                    <tr key={app.application_id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono text-xs">{app.application_no}</td>
                      <td className="px-3 py-2 font-medium">{app.student?.name}</td>
                      <td className="px-3 py-2">{app.student?.gender}</td>
                      <td className="px-3 py-2 text-xs">{app.student?.community?.community_name || '-'}</td>
                      <td className="px-3 py-2 text-xs">{app.student?.admission_type}</td>
                      <td className="px-3 py-2 text-xs">{app.student?.hostel_required ? <span className="text-green-600">Yes</span> : 'No'}</td>
                      <td className="px-3 py-2"><StatusBadge status={app.status} /></td>
                      <td className="px-3 py-2 text-xs text-gray-500">{new Date(app.created_at).toLocaleDateString('en-IN')}</td>
                      <td className="px-3 py-2">
                        <button onClick={() => viewDetail(app.application_id)} className="p-1 text-primary hover:bg-blue-50 rounded"><Eye size={15} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      <Modal open={showDetail} onClose={() => setShowDetail(false)} title="Application Details" size="xl">
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {[
                ['Application No.', selected.application_no], ['Status', selected.status],
                ['Name', selected.student?.name], ['Mobile', selected.student?.mobile],
                ['Gender', selected.student?.gender], ['DOB', selected.student?.dob],
                ['Admission Type', selected.student?.admission_type], ['Community', selected.student?.community?.community_name],
                ["Father's Name", selected.student?.father_name], ['Annual Income', `₹${selected.student?.annual_income || 0}`],
                ['Board', selected.student?.board], ['Register No.', selected.student?.register_no],
                ['Hostel Required', selected.student?.hostel_required ? 'Yes' : 'No'],
              ].map(([l, v]) => (
                <div key={l}><span className="font-medium text-gray-600">{l}:</span> <span className="text-gray-800">{v || '-'}</span></div>
              ))}
            </div>

            {selected.marks?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Marks</h4>
                <table className="w-full text-xs border">
                  <thead className="bg-gray-50"><tr><th className="text-left px-2 py-1">Subject</th><th className="px-2 py-1">Obtained</th><th className="px-2 py-1">Max</th></tr></thead>
                  <tbody>{selected.marks.map((m, i) => <tr key={i} className="border-t"><td className="px-2 py-1">{m.subject_name}</td><td className="px-2 py-1 text-center">{m.marks_obtained}</td><td className="px-2 py-1 text-center">{m.max_marks}</td></tr>)}</tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}

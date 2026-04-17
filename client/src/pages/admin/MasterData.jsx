import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/uiSlice';
import AppLayout from '../../components/layout/AppLayout';
import Spinner from '../../components/common/Spinner';
import api from '../../services/api';
import { Plus } from 'lucide-react';

export default function AdminMasterData() {
  const dispatch = useDispatch();
  const [tab, setTab] = useState('districts');
  const [districts, setDistricts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [years, setYears] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({});

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/districts').then((r) => setDistricts(r.data.data || [])),
      api.get('/admin/communities').then((r) => setCommunities(r.data.data || [])),
      api.get('/admin/academic-years').then((r) => setYears(r.data.data || [])),
      api.get('/admin/fee-structures').then((r) => setFees(r.data.data || [])),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const addDistrict = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/districts', { district_name: form.district_name, state: form.state || 'Tamil Nadu' });
      dispatch(addToast({ type: 'success', message: 'District added' }));
      setForm({}); load();
    } catch { dispatch(addToast({ type: 'error', message: 'Failed' })); }
  };

  const addCommunity = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/communities', { community_code: form.comm_code, community_name: form.comm_name });
      dispatch(addToast({ type: 'success', message: 'Community added' }));
      setForm({}); load();
    } catch { dispatch(addToast({ type: 'error', message: 'Failed' })); }
  };

  const addYear = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/academic-years', { year_label: form.year_label, is_active: form.is_active ? 1 : 0, app_open_date: form.app_open_date, app_close_date: form.app_close_date });
      dispatch(addToast({ type: 'success', message: 'Academic year added' }));
      setForm({}); load();
    } catch { dispatch(addToast({ type: 'error', message: 'Failed' })); }
  };

  const activateYear = async (id) => {
    try {
      await api.put(`/admin/academic-years/${id}`, { is_active: 1 });
      dispatch(addToast({ type: 'success', message: 'Year activated' }));
      load();
    } catch { dispatch(addToast({ type: 'error', message: 'Failed' })); }
  };

  const saveFee = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/fee-structures', form);
      dispatch(addToast({ type: 'success', message: 'Fee saved' }));
      setForm({}); load();
    } catch { dispatch(addToast({ type: 'error', message: 'Failed' })); }
  };

  const upd = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const tabs = ['districts', 'communities', 'academic-years', 'fees'];

  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Master Data Management</h1>

        <div className="flex gap-1 border-b">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t.replace('-', ' ')}
            </button>
          ))}
        </div>

        {loading ? <Spinner size="md" className="py-12" /> : (
          <>
            {tab === 'districts' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 card !p-0 overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-sm"><thead className="bg-gray-50 sticky top-0"><tr><th className="text-left px-3 py-2">ID</th><th className="text-left px-3 py-2">District Name</th><th className="text-left px-3 py-2">State</th></tr></thead>
                      <tbody className="divide-y">{districts.map((d) => <tr key={d.district_id} className="hover:bg-gray-50"><td className="px-3 py-2 text-gray-500">{d.district_id}</td><td className="px-3 py-2">{d.district_name}</td><td className="px-3 py-2 text-gray-500">{d.state}</td></tr>)}</tbody>
                    </table>
                  </div>
                </div>
                <div className="card">
                  <h3 className="font-medium text-gray-800 mb-3">Add District</h3>
                  <form onSubmit={addDistrict} className="space-y-3">
                    <div><label className="form-label text-xs">District Name *</label><input className="form-input text-sm" value={form.district_name || ''} onChange={(e) => upd('district_name', e.target.value)} required /></div>
                    <div><label className="form-label text-xs">State</label><input className="form-input text-sm" value={form.state || ''} onChange={(e) => upd('state', e.target.value)} placeholder="Tamil Nadu" /></div>
                    <button type="submit" className="btn-primary w-full text-sm">Add</button>
                  </form>
                </div>
              </div>
            )}

            {tab === 'communities' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 card !p-0 overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-sm"><thead className="bg-gray-50 sticky top-0"><tr><th className="text-left px-3 py-2">Code</th><th className="text-left px-3 py-2">Community</th><th className="text-left px-3 py-2">Castes</th></tr></thead>
                      <tbody className="divide-y">{communities.map((c) => <tr key={c.community_id} className="hover:bg-gray-50"><td className="px-3 py-2 font-mono text-xs">{c.community_code}</td><td className="px-3 py-2">{c.community_name}</td><td className="px-3 py-2 text-xs text-gray-500">{c.castes?.length || 0} castes</td></tr>)}</tbody>
                    </table>
                  </div>
                </div>
                <div className="card">
                  <h3 className="font-medium text-gray-800 mb-3">Add Community</h3>
                  <form onSubmit={addCommunity} className="space-y-3">
                    <div><label className="form-label text-xs">Code *</label><input className="form-input text-sm" value={form.comm_code || ''} onChange={(e) => upd('comm_code', e.target.value)} placeholder="OC, BC, SC..." required /></div>
                    <div><label className="form-label text-xs">Name *</label><input className="form-input text-sm" value={form.comm_name || ''} onChange={(e) => upd('comm_name', e.target.value)} required /></div>
                    <button type="submit" className="btn-primary w-full text-sm">Add</button>
                  </form>
                </div>
              </div>
            )}

            {tab === 'academic-years' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 card !p-0 overflow-hidden">
                  <table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="text-left px-3 py-2">Year</th><th className="text-left px-3 py-2">Open Date</th><th className="text-left px-3 py-2">Close Date</th><th className="text-left px-3 py-2">Status</th><th className="px-3 py-2"></th></tr></thead>
                    <tbody className="divide-y">{years.map((y) => <tr key={y.year_id} className="hover:bg-gray-50"><td className="px-3 py-2 font-medium">{y.year_label}</td><td className="px-3 py-2 text-sm text-gray-600">{y.app_open_date || '-'}</td><td className="px-3 py-2 text-sm text-gray-600">{y.app_close_date || '-'}</td><td className="px-3 py-2">{y.is_active ? <span className="badge-paid">Active</span> : <span className="badge-draft">Inactive</span>}</td><td className="px-3 py-2">{!y.is_active && <button onClick={() => activateYear(y.year_id)} className="text-xs text-primary hover:underline">Activate</button>}</td></tr>)}</tbody>
                  </table>
                </div>
                <div className="card">
                  <h3 className="font-medium text-gray-800 mb-3">Add Academic Year</h3>
                  <form onSubmit={addYear} className="space-y-3">
                    <div><label className="form-label text-xs">Year Label *</label><input className="form-input text-sm" value={form.year_label || ''} onChange={(e) => upd('year_label', e.target.value)} placeholder="2025-26" required /></div>
                    <div><label className="form-label text-xs">Open Date</label><input className="form-input text-sm" type="date" value={form.app_open_date || ''} onChange={(e) => upd('app_open_date', e.target.value)} /></div>
                    <div><label className="form-label text-xs">Close Date</label><input className="form-input text-sm" type="date" value={form.app_close_date || ''} onChange={(e) => upd('app_close_date', e.target.value)} /></div>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.is_active} onChange={(e) => upd('is_active', e.target.checked)} /> Set as Active</label>
                    <button type="submit" className="btn-primary w-full text-sm">Add</button>
                  </form>
                </div>
              </div>
            )}

            {tab === 'fees' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 card !p-0 overflow-hidden">
                  <table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="text-left px-3 py-2">Year</th><th className="text-left px-3 py-2">Category</th><th className="text-left px-3 py-2">Amount</th></tr></thead>
                    <tbody className="divide-y">{fees.map((f) => <tr key={f.fee_id} className="hover:bg-gray-50"><td className="px-3 py-2">{f.AcademicYear?.year_label}</td><td className="px-3 py-2">{f.category}</td><td className="px-3 py-2 font-semibold">{f.amount == 0 ? <span className="text-green-600">Free</span> : `₹${f.amount}`}</td></tr>)}</tbody>
                  </table>
                </div>
                <div className="card">
                  <h3 className="font-medium text-gray-800 mb-3">Set Fee</h3>
                  <form onSubmit={saveFee} className="space-y-3">
                    <div><label className="form-label text-xs">Academic Year *</label><select className="form-select text-sm" value={form.year_id || ''} onChange={(e) => upd('year_id', e.target.value)} required><option value="">Select</option>{years.map((y) => <option key={y.year_id} value={y.year_id}>{y.year_label}</option>)}</select></div>
                    <div><label className="form-label text-xs">Category *</label><input className="form-input text-sm" value={form.category || ''} onChange={(e) => upd('category', e.target.value)} placeholder="OC, BC, SC, ST..." required /></div>
                    <div><label className="form-label text-xs">Amount (₹) *</label><input className="form-input text-sm" type="number" min={0} value={form.amount || ''} onChange={(e) => upd('amount', e.target.value)} placeholder="0 for free" required /></div>
                    <button type="submit" className="btn-primary w-full text-sm">Save Fee</button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

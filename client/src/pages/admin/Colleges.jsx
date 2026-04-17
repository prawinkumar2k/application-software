import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllCollegesAdmin } from '../../store/slices/collegeSlice';
import { addToast } from '../../store/slices/uiSlice';
import AppLayout from '../../components/layout/AppLayout';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import api from '../../services/api';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

const EMPTY = { college_code: '', college_name: '', address: '', district_id: '', gender_type: 'CO-ED', hostel_available: 0, hostel_gender: '', college_type: 'GOVERNMENT', phone: '', email: '' };

export default function AdminColleges() {
  const dispatch = useDispatch();
  const { allColleges, loading } = useSelector((s) => s.colleges);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [districts, setDistricts] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchAllCollegesAdmin({ limit: 1000, page: 1 }));
    api.get('/admin/districts').then((r) => setDistricts(r.data.data || []));
  }, [dispatch]);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ ...c, district_id: c.district_id || '' }); setShowModal(true); };
  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/admin/colleges/${editing.college_id}`, form);
        dispatch(addToast({ type: 'success', message: 'College updated' }));
      } else {
        await api.post('/admin/colleges', form);
        dispatch(addToast({ type: 'success', message: 'College created' }));
      }
      setShowModal(false);
      dispatch(fetchAllCollegesAdmin({ limit: 1000, page: 1 }));
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.response?.data?.message || 'Failed' }));
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this college?')) return;
    try {
      await api.delete(`/admin/colleges/${id}`);
      dispatch(addToast({ type: 'success', message: 'College deactivated' }));
      dispatch(fetchAllCollegesAdmin({ limit: 1000, page: 1 }));
    } catch { dispatch(addToast({ type: 'error', message: 'Failed' })); }
  };

  const filtered = allColleges.filter((c) => c.college_name?.toLowerCase().includes(search.toLowerCase()) || c.college_code?.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Colleges & Courses</h1>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add College</button>
        </div>

        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="form-input pl-9" placeholder="Search colleges..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="card !p-0 overflow-hidden">
          {loading ? <Spinner size="md" className="py-12" /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>{['Code', 'Name', 'District', 'Type', 'Gender', 'Hostel', 'Actions'].map((h) => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((c) => (
                    <tr key={c.college_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{c.college_code}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{c.college_name}</td>
                      <td className="px-4 py-3 text-gray-600">{c.district?.district_name || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{c.college_type}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${c.gender_type === 'FEMALE' ? 'bg-pink-100 text-pink-700' : c.gender_type === 'MALE' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{c.gender_type}</span></td>
                      <td className="px-4 py-3">{c.hostel_available ? <span className="text-green-600 text-xs">✓ {c.hostel_gender}</span> : <span className="text-gray-400 text-xs">No</span>}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(c)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Pencil size={14} /></button>
                          <button onClick={() => handleDelete(c.college_id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">No colleges found</p>}
            </div>
          )}
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit College' : 'Add College'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">College Code *</label>
              <input className="form-input" value={form.college_code} onChange={(e) => update('college_code', e.target.value)} required />
            </div>
            <div>
              <label className="form-label">College Type</label>
              <select className="form-select" value={form.college_type} onChange={(e) => update('college_type', e.target.value)}>
                {['GOVERNMENT','AIDED','SELF_FINANCE'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="form-label">College Name *</label>
              <input className="form-input" value={form.college_name} onChange={(e) => update('college_name', e.target.value)} required />
            </div>
            <div className="col-span-2">
              <label className="form-label">Address</label>
              <textarea className="form-input" rows={2} value={form.address} onChange={(e) => update('address', e.target.value)} />
            </div>
            <div>
              <label className="form-label">District</label>
              <select className="form-select" value={form.district_id} onChange={(e) => update('district_id', e.target.value)}>
                <option value="">Select District</option>
                {districts.map((d) => <option key={d.district_id} value={d.district_id}>{d.district_name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Gender Type *</label>
              <select className="form-select" value={form.gender_type} onChange={(e) => update('gender_type', e.target.value)} required>
                {['MALE','FEMALE','CO-ED'].map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Hostel Available</label>
              <select className="form-select" value={form.hostel_available} onChange={(e) => update('hostel_available', parseInt(e.target.value))}>
                <option value={0}>No</option><option value={1}>Yes</option>
              </select>
            </div>
            {form.hostel_available == 1 && (
              <div>
                <label className="form-label">Hostel Gender</label>
                <select className="form-select" value={form.hostel_gender} onChange={(e) => update('hostel_gender', e.target.value)}>
                  <option value="">Select</option>
                  {['MALE','FEMALE','BOTH'].map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? <Spinner size="sm" /> : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}

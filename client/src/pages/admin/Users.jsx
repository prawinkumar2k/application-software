import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/uiSlice';
import AppLayout from '../../components/layout/AppLayout';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import api from '../../services/api';
import { Plus, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';

const EMPTY = { name: '', email: '', password: '', role: 'COLLEGE_STAFF', college_id: '' };

export default function AdminUsers() {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const loadUsers = () => {
    setLoading(true);
    api.get('/admin/users').then((r) => setUsers(r.data.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
    api.get('/admin/colleges', { params: { limit: 1000, page: 1 } }).then((r) => setColleges(r.data.data || []));
  }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (u) => { setEditing(u); setForm({ name: u.name, email: u.email, password: '', role: u.role, college_id: u.college_id || '' }); setShowModal(true); };
  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form };
      if (!data.password) delete data.password;
      if (editing) await api.put(`/admin/users/${editing.user_id}`, data);
      else await api.post('/admin/users', form);
      dispatch(addToast({ type: 'success', message: editing ? 'User updated' : 'User created' }));
      setShowModal(false);
      loadUsers();
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.response?.data?.message || 'Failed' }));
    }
    setSaving(false);
  };

  const toggleStatus = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/toggle`);
      dispatch(addToast({ type: 'success', message: 'Status updated' }));
      loadUsers();
    } catch { dispatch(addToast({ type: 'error', message: 'Failed' })); }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">User Management</h1>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add User</button>
        </div>

        <div className="card !p-0 overflow-hidden">
          {loading ? <Spinner size="md" className="py-12" /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>{['Name', 'Email', 'Role', 'College', 'Status', 'Last Login', 'Actions'].map((h) => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((u) => (
                    <tr key={u.user_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{u.name}</td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span></td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{u.college?.college_name || '-'}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.is_active ? 'Active' : 'Disabled'}</span></td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{u.last_login ? new Date(u.last_login).toLocaleDateString('en-IN') : 'Never'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(u)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Pencil size={14} /></button>
                          <button onClick={() => toggleStatus(u.user_id)} className={`p-1 rounded ${u.is_active ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>
                            {u.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">No users found</p>}
            </div>
          )}
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit User' : 'Add User'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="form-label">Full Name *</label>
            <input className="form-input" value={form.name} onChange={(e) => update('name', e.target.value)} required />
          </div>
          <div>
            <label className="form-label">Email *</label>
            <input className="form-input" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
          </div>
          <div>
            <label className="form-label">{editing ? 'New Password (leave blank to keep)' : 'Password *'}</label>
            <input className="form-input" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required={!editing} />
          </div>
          <div>
            <label className="form-label">Role *</label>
            <select className="form-select" value={form.role} onChange={(e) => update('role', e.target.value)}>
              <option value="COLLEGE_STAFF">College Staff</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
          {form.role === 'COLLEGE_STAFF' && (
            <div>
              <label className="form-label">Assign College</label>
              <select className="form-select" value={form.college_id} onChange={(e) => update('college_id', e.target.value)}>
                <option value="">Select College</option>
                {colleges.map((c) => <option key={c.college_id} value={c.college_id}>{c.college_name}</option>)}
              </select>
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? <Spinner size="sm" /> : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}

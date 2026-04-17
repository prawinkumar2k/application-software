import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginAdmin } from '../../store/slices/authSlice';
import { addToast } from '../../store/slices/uiSlice';
import Spinner from '../../components/common/Spinner';

export default function AdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await dispatch(loginAdmin(form));
    if (res.meta.requestStatus === 'fulfilled') {
      dispatch(addToast({ type: 'success', message: 'Login successful!' }));
      const role = res.payload?.data?.user?.role;
      navigate(role === 'SUPER_ADMIN' ? '/admin/dashboard' : '/college/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary">Staff / Admin Login</h1>
          <p className="text-gray-500 text-sm mt-1">DOTE Admission Management System</p>
        </div>
        <div className="card">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="form-label">Email Address *</label>
              <input className="form-input" type="email" placeholder="admin@dote.tn.gov.in" value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
            </div>
            <div>
              <label className="form-label">Password *</label>
              <input className="form-input" type="password" value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
            </div>
            {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</p>}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? <Spinner size="sm" className="inline" /> : 'Login'}
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-4 text-center">Default: admin@dote.tn.gov.in / Admin@123</p>
        </div>
        <p className="text-center mt-3 text-sm text-gray-500">
          <Link to="/login" className="hover:underline text-primary">← Student Login</Link>
        </p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginStudent } from '../../store/slices/authSlice';
import { addToast } from '../../store/slices/uiSlice';
import Spinner from '../../components/common/Spinner';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ mobile: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await dispatch(loginStudent(form));
    if (res.meta.requestStatus === 'fulfilled') {
      dispatch(addToast({ type: 'success', message: 'Login successful!' }));
      navigate('/student/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary">Student Login</h1>
          <p className="text-gray-500 text-sm mt-1">DOTE Admission Management System</p>
        </div>
        <div className="card">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="form-label">Mobile Number *</label>
              <input className="form-input" type="tel" placeholder="Registered mobile number" value={form.mobile}
                onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))} required />
            </div>
            <div>
              <label className="form-label">Password *</label>
              <input className="form-input" type="password" placeholder="Your password" value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
            </div>
            {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</p>}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? <Spinner size="sm" className="inline" /> : 'Login'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-600 mt-4">
            New applicant? <Link to="/register" className="text-primary hover:underline">Register here</Link>
          </p>
        </div>
        <p className="text-center mt-4 text-sm text-gray-500">
          <Link to="/admin/login" className="hover:underline text-primary">College / Admin Login →</Link>
        </p>
        <p className="text-center text-xs text-gray-400 mt-2">
          <Link to="/" className="hover:underline">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}

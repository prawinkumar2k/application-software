import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerStudent, verifyOTP } from '../../store/slices/authSlice';
import { addToast } from '../../store/slices/uiSlice';
import Spinner from '../../components/common/Spinner';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, otpSent } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ mobile: '', email: '', otp: '', password: '', confirmPassword: '', name: '' });

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await dispatch(registerStudent({ mobile: form.mobile, email: form.email }));
    if (res.meta.requestStatus === 'fulfilled') {
      dispatch(addToast({ type: 'success', message: 'OTP sent! Check your email or use the OTP shown in response (dev mode).' }));
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      dispatch(addToast({ type: 'error', message: 'Passwords do not match' }));
      return;
    }
    const res = await dispatch(verifyOTP({ mobile: form.mobile, otp: form.otp, password: form.password, name: form.name }));
    if (res.meta.requestStatus === 'fulfilled') {
      dispatch(addToast({ type: 'success', message: 'Registration successful! Welcome.' }));
      navigate('/student/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary">Student Registration</h1>
          <p className="text-gray-500 text-sm mt-1">DOTE Admission Management System</p>
        </div>

        <div className="card">
          {!otpSent ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <h2 className="font-semibold text-gray-800 mb-4">Step 1: Enter Mobile Number</h2>
              <div>
                <label className="form-label">Mobile Number *</label>
                <input className="form-input" type="tel" placeholder="10-digit mobile number" maxLength={10}
                  value={form.mobile} onChange={(e) => update('mobile', e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Email Address (optional)</label>
                <input className="form-input" type="email" placeholder="For OTP delivery"
                  value={form.email} onChange={(e) => update('email', e.target.value)} />
              </div>
              {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</p>}
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? <Spinner size="sm" className="inline" /> : 'Send OTP'}
              </button>
              <p className="text-center text-sm text-gray-600">Already registered? <Link to="/login" className="text-primary hover:underline">Login</Link></p>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <h2 className="font-semibold text-gray-800 mb-4">Step 2: Verify OTP & Set Password</h2>
              <div>
                <label className="form-label">Full Name *</label>
                <input className="form-input" placeholder="Your full name" value={form.name}
                  onChange={(e) => update('name', e.target.value)} required />
              </div>
              <div>
                <label className="form-label">OTP *</label>
                <input className="form-input" placeholder="6-digit OTP" maxLength={6} value={form.otp}
                  onChange={(e) => update('otp', e.target.value)} required />
                <p className="text-xs text-gray-500 mt-1">OTP sent to {form.email || form.mobile}</p>
              </div>
              <div>
                <label className="form-label">Set Password *</label>
                <input className="form-input" type="password" placeholder="Minimum 6 characters" value={form.password}
                  onChange={(e) => update('password', e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Confirm Password *</label>
                <input className="form-input" type="password" placeholder="Re-enter password" value={form.confirmPassword}
                  onChange={(e) => update('confirmPassword', e.target.value)} required />
              </div>
              {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</p>}
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? <Spinner size="sm" className="inline" /> : 'Complete Registration'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          <Link to="/" className="hover:underline">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}

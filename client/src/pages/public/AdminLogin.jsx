import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginAdmin } from '../../store/slices/authSlice';
import { addToast } from '../../store/slices/uiSlice';
import Spinner from '../../components/common/Spinner';
import { Mail, Lock, ChevronLeft, ShieldAlert } from 'lucide-react';
import govtLogo from '../../assets/govt_logo.png';
import img1 from '../../assets/img-1.jpeg';

export default function AdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await dispatch(loginAdmin(form));
    if (res.meta.requestStatus === 'fulfilled') {
      dispatch(addToast({ type: 'success', message: 'Staff login successful!' }));
      const role = res.payload?.data?.user?.role;
      navigate(role === 'SUPER_ADMIN' ? '/admin/dashboard' : '/college/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side: Admin Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0">
          <img src={img1} alt="Admin Portal" className="w-full h-full object-cover opacity-20 contrast-125" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/90 to-transparent" />
        </div>
        
        <div className="relative z-10 w-full p-16 flex flex-col justify-between">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="bg-white p-2 rounded-xl scale-90">
              <img src={govtLogo} alt="Logo" className="w-14 h-14 object-contain" />
            </div>
            <div className="h-10 w-[1.5px] bg-white/20" />
            <div className="text-white">
              <h1 className="font-black text-xl mb-3 leading-tight uppercase tracking-tighter">தொழில்நுட்பக் கல்வி இயக்ககம்</h1>
              <p className="text-[14px] font-bold text-blue-200 uppercase tracking-widest leading-none">DIRECTORATE OF TECHNICAL EDUCATION</p>
            </div>
          </Link>

          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary-light text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              Restricted Access
            </span>
            <h2 className="text-5xl font-black text-white mb-6 leading-tight">
              Management & <br />
              <span className="text-primary-light tracking-tighter">Coordination.</span>
            </h2>
            <p className="text-slate-300 text-lg max-w-md font-medium leading-relaxed opacity-90">
              Authorized personnel only. Please sign in to manage student applications, college allotments, and system reports.
            </p>
          </div>

          <div className="flex items-center gap-4 text-white/40 text-xs font-bold uppercase tracking-widest">
             <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-primary-light" />
                <span>Secure Access</span>
             </div>
             <div className="w-1 h-1 rounded-full bg-white/10" />
             <span>Staff Authenticated</span>
          </div>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-gray-50/50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-10">
            <img src={govtLogo} alt="Logo" className="w-20 h-20 mx-auto mb-4 object-contain" />
            <h1 className="text-xl font-black text-slate-900 uppercase">Admin Portal</h1>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-900/5 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-light to-transparent" />
            
            <div className="mb-10 lg:text-left text-center">
              <h3 className="text-3xl font-black text-slate-900 mb-2">Admin</h3>
              <p className="text-gray-500 font-medium text-sm">Welcome back! Please enter your credentials.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1">Official Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none text-gray-400 border-r border-gray-100 group-focus-within:text-primary-light transition-colors">
                    <Mail size={18} />
                  </div>
                  <input 
                    className="w-full pl-14 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                    type="email" 
                    placeholder="admin@dote.tn.gov.in" 
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1">Master Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none text-gray-400 border-r border-gray-100 group-focus-within:text-primary-light transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    className="w-full pl-14 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                    type="password" 
                    placeholder="••••••••" 
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} 
                    required 
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:scale-100 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                disabled={loading}
              >
                {loading ? <Spinner size="sm" /> : 'Sign In to Portal'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-50 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                Default: admin@dote.tn.gov.in <br /> Admin@123
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-4">
             <Link to="/login" className="text-sm font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors flex items-center gap-2">
               ← Student Admission Portal
             </Link>
             <Link to="/" className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
               <ChevronLeft size={14} /> Back to Homepage
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


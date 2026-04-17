import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginStudent } from '../../store/slices/authSlice';
import { addToast } from '../../store/slices/uiSlice';
import Spinner from '../../components/common/Spinner';
import { Phone, Lock, ChevronLeft, Building2 } from 'lucide-react';
import govtLogo from '../../assets/govt_logo.png';
import img1 from '../../assets/img-1.jpeg';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ mobile: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await dispatch(loginStudent(form));
    if (res.meta.requestStatus === 'fulfilled') {
      dispatch(addToast({ type: 'success', message: 'Hello! You have successfully logged in.' }));
      navigate('/student/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side: Branding & Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary">
        <div className="absolute inset-0">
          <img src={img1} alt="Campus" className="w-full h-full object-cover opacity-30 scale-105" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-transparent" />
        </div>
        
        <div className="relative z-10 w-full p-16 flex flex-col justify-between">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="bg-white p-2 rounded-xl">
              <img src={govtLogo} alt="Logo" className="w-16 h-16 object-contain" />
            </div>
            <div className="h-12 w-[2px] bg-white/20" />
            <div className="text-white">
              <h1 className="font-black text-xl mb-3 leading-tight uppercase tracking-tighter">தொழில்நுட்பக் கல்வி இயக்ககம்</h1>
              <p className="text-[14px] font-bold text-blue-200 uppercase tracking-widest leading-none">DIRECTORATE OF TECHNICAL EDUCATION</p>
            </div>
          </Link>

          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary text-primary-dark text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              Official Student Portal
            </span>
            <h2 className="text-5xl font-black text-white mb-6 leading-tight">
              Access Your <br />
              <span className="text-secondary tracking-tighter">Future Today.</span>
            </h2>
            <p className="text-blue-100 text-lg max-w-md font-medium leading-relaxed opacity-90">
              Log in to complete your polytechnic admission application, track your status, and manage your documents securely.
            </p>
          </div>

          <div className="flex items-center gap-4 text-white/60 text-xs font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-secondary" />
                <span>50+ Govt. Colleges</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <span>Secure Digital Admission</span>
          </div>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-gray-50/50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-10">
            <img src={govtLogo} alt="Logo" className="w-20 h-20 mx-auto mb-4 object-contain" />
            <h1 className="text-xl font-black text-primary uppercase">DOTE Admissions</h1>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent" />
            
            <div className="mb-10 lg:text-left text-center">
              <h3 className="text-3xl font-black text-gray-900 mb-2">Student Login</h3>
              <p className="text-gray-500 font-medium text-sm">Welcome back! Please enter your details.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1">Registered Mobile Number</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-1 py-1 h-full w-12 flex items-center justify-center pointer-events-none text-gray-400 border-r border-gray-100 group-focus-within:text-primary transition-colors">
                    <Phone size={18} />
                  </div>
                  <input 
                    className="w-full pl-14 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 font-bold focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                    type="tel" 
                    placeholder="Enter 10 digit number" 
                    value={form.mobile}
                    onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))} 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1">Account Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-1 py-1 h-full w-12 flex items-center justify-center pointer-events-none text-gray-400 border-r border-gray-100 group-focus-within:text-primary transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    className="w-full pl-14 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 font-bold focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                    type="password" 
                    placeholder="••••••••" 
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} 
                    required 
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 animate-shake">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:scale-100 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                disabled={loading}
              >
                {loading ? <Spinner size="sm" /> : 'Log In to Portal'}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-gray-50 flex flex-col items-center gap-4">
              <p className="text-sm font-bold text-gray-500">
                New applicant? <Link to="/register" className="text-primary hover:text-primary-light transition-colors">Create account</Link>
              </p>
            </div>
          </div>

          <div className="mt-12 space-y-4 flex flex-col items-center">
             <Link to="/admin/login" className="text-sm font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors flex items-center gap-2">
               Admin / College Portal <ChevronLeft size={16} className="rotate-180" />
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


import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerStudent, verifyOTP } from '../../store/slices/authSlice';
import { addToast } from '../../store/slices/uiSlice';
import Spinner from '../../components/common/Spinner';
import { Phone, Mail, User, ShieldCheck, Lock, ChevronLeft, CheckCircle2 } from 'lucide-react';
import govtLogo from '../../assets/govt_logo.png';
import img2 from '../../assets/img-2.jpeg';

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
      dispatch(addToast({ type: 'success', message: 'OTP sent! Please check your mobile/email.' }));
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
      dispatch(addToast({ type: 'success', message: 'Registration successful! Welcome to DOTE.' }));
      navigate('/student/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Column: Branding & Info */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-primary">
        <div className="absolute inset-0">
          <img src={img2} alt="Registration" className="w-full h-full object-cover opacity-20 scale-110" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-transparent" />
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
             <div className="flex gap-2 mb-8">
               <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${!otpSent ? 'bg-secondary' : 'bg-white/20'}`} />
               <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${otpSent ? 'bg-secondary' : 'bg-white/20'}`} />
             </div>
            <h2 className="text-4xl font-black text-white mb-6 leading-tight">
              Start Your <br />
              <span className="text-secondary tracking-tighter">Academic Journey.</span>
            </h2>
            <p className="text-blue-100 text-lg max-w-sm font-medium leading-relaxed opacity-80">
              Secure your future by registering with Tamil Nadu's leading technical education portal. Simple, transparent, and direct.
            </p>
          </div>

          <div className="space-y-4">
             {[
               'Verify with OTP for security',
               'Access 50+ Govt. Colleges',
               'Centralized Application System'
             ].map((text, i) => (
               <div key={i} className="flex items-center gap-3 text-white/70 text-xs font-bold uppercase tracking-widest">
                 <CheckCircle2 size={16} className="text-secondary" />
                 <span>{text}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Right Column: Multi-step Form */}
      <div className="w-full lg:w-7/12 flex flex-col justify-center items-center p-8 bg-gray-50/50">
        <div className="w-full max-w-xl">
           <div className="lg:hidden text-center mb-10">
            <img src={govtLogo} alt="Logo" className="w-16 h-16 mx-auto mb-4 object-contain" />
            <h1 className="text-lg font-black text-primary uppercase tracking-tighter">DOTE Registration</h1>
          </div>

          <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-gray-100 relative overflow-hidden">
             {/* Progress bar */}
             <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
                <div className={`h-full bg-secondary transition-all duration-700 ${otpSent ? 'w-full' : 'w-1/2'}`} />
             </div>

            {!otpSent ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-10">
                  <h3 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Step 1: Mobile OTP</h3>
                  <p className="text-gray-500 font-medium text-sm">Let's start by verifying your identity.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1">Mobile Number *</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none text-gray-400 border-r border-gray-100 group-focus-within:text-primary transition-colors">
                          <Phone size={18} />
                        </div>
                        <input className="w-full pl-14 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 font-bold focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                          type="tel" placeholder="10-digit number" value={form.mobile} onChange={(e) => update('mobile', e.target.value)} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1">Email Address</label>
                       <div className="relative group">
                        <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none text-gray-400 border-r border-gray-100 group-focus-within:text-primary transition-colors">
                          <Mail size={18} />
                        </div>
                        <input className="w-full pl-14 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 font-bold focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                          type="email" placeholder="example@mail.com" value={form.email} onChange={(e) => update('email', e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {error && <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">{error}</div>}

                  <button type="submit" className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:translate-y-[-2px] active:translate-y-[0] disabled:opacity-70 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm" disabled={loading}>
                    {loading ? <Spinner size="sm" /> : 'Send Verification OTP'}
                  </button>
                  
                  <div className="pt-6 border-t border-gray-50 text-center">
                    <p className="text-sm font-bold text-gray-500">
                      Already registered? <Link to="/login" className="text-primary hover:text-primary-light transition-colors">Log in instead</Link>
                    </p>
                  </div>
                </form>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-10 flex justify-between items-end">
                  <div>
                    <h3 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Step 2: Account Details</h3>
                    <p className="text-gray-500 font-medium text-sm">Check OTP sent to {form.mobile}</p>
                  </div>
                  <button onClick={() => update('otpSent', false)} className="text-xs font-black text-primary uppercase hover:underline mb-2">Change Info</button>
                </div>

                <form onSubmit={handleVerify} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1">Full Name *</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none text-gray-400 border-r border-gray-100 group-focus-within:text-primary transition-colors">
                        <User size={18} />
                      </div>
                      <input className="w-full pl-14 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 font-bold focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                        placeholder="Legal name as per SSLC" value={form.name} onChange={(e) => update('name', e.target.value)} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1">6-Digit OTP *</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none text-gray-400 border-r border-gray-100 group-focus-within:text-primary transition-colors">
                        <ShieldCheck size={18} />
                      </div>
                      <input className="w-full pl-14 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 font-bold focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                        placeholder="000000" maxLength={6} value={form.otp} onChange={(e) => update('otp', e.target.value)} required />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1">Set Password *</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none text-gray-400 border-r border-gray-100 group-focus-within:text-primary transition-colors">
                          <Lock size={18} />
                        </div>
                        <input className="w-full pl-14 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 font-bold focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                          type="password" placeholder="••••••••" value={form.password} onChange={(e) => update('password', e.target.value)} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1">Confirm Password *</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none text-gray-400 border-r border-gray-100 group-focus-within:text-primary transition-colors">
                          <Lock size={18} />
                        </div>
                        <input className="w-full pl-14 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 font-bold focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                          type="password" placeholder="••••••••" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} required />
                      </div>
                    </div>
                  </div>

                  {error && <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">{error}</div>}

                  <button type="submit" className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm" disabled={loading}>
                    {loading ? <Spinner size="sm" /> : 'Complete Registration'}
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="mt-12 flex flex-col items-center gap-4">
             <Link to="/" className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
               <ChevronLeft size={14} /> Back to Homepage
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


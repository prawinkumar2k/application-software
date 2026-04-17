import { Link } from 'react-router-dom';
import { GraduationCap, Building2, ClipboardCheck, CreditCard } from 'lucide-react';

const features = [
  { icon: GraduationCap, title: 'Online Registration', desc: 'Register with your mobile number and verify with OTP to create your profile.' },
  { icon: Building2, title: 'College Selection', desc: 'Browse and select from all Government Polytechnic Colleges across Tamil Nadu.' },
  { icon: ClipboardCheck, title: 'Easy Application', desc: 'Fill your application form in simple steps with auto-save functionality.' },
  { icon: CreditCard, title: 'Secure Payment', desc: 'Pay application fee securely via Indian Bank (CCAvenue). Fee waiver supported.' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <GraduationCap size={28} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">DOTE Admission Management System</h1>
              <p className="text-blue-200 text-xs">Government of Tamil Nadu – Directorate of Technical Education</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/login" className="text-sm text-blue-200 hover:text-white px-3 py-1.5 rounded border border-blue-400 hover:border-white transition-colors">Staff Login</Link>
            <Link to="/login" className="text-sm bg-white text-primary font-medium px-4 py-1.5 rounded hover:bg-blue-50 transition-colors">Student Login</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-primary text-white pb-16 pt-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Apply to Government Polytechnic Colleges</h2>
          <p className="text-blue-200 text-lg mb-8 max-w-2xl mx-auto">
            A single portal to apply for First Year, Lateral Entry, and Part-Time diploma admissions across Tamil Nadu.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/register" className="bg-secondary text-primary-dark font-semibold px-8 py-3 rounded-lg hover:bg-yellow-400 transition-colors text-base">
              Register Now
            </Link>
            <Link to="/login" className="bg-white/10 border border-white/40 text-white font-medium px-8 py-3 rounded-lg hover:bg-white/20 transition-colors text-base">
              Student Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h3 className="text-center text-2xl font-bold text-gray-800 mb-10">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <div key={i} className="card text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon size={28} className="text-primary" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>
              <p className="text-gray-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Info strip */}
      <section className="bg-primary/5 border-t border-primary/10 py-8">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[['Admission Types', 'First Year / Lateral Entry / Part-Time'], ['Supported Browsers', 'Chrome, Firefox, Edge (latest)'], ['Payment', 'Indian Bank via CCAvenue']].map(([title, val]) => (
            <div key={title}>
              <p className="font-semibold text-primary">{title}</p>
              <p className="text-gray-600 text-sm">{val}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-primary text-center text-blue-200 text-xs py-4">
        © {new Date().getFullYear()} Directorate of Technical Education, Government of Tamil Nadu. All rights reserved.
      </footer>
    </div>
  );
}

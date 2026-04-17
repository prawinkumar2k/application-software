import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, Building2, ClipboardCheck, CreditCard, 
  ChevronLeft, ChevronRight, CheckCircle2, Phone, Mail, MapPin,
  ExternalLink, Info, Users, School, Calendar
} from 'lucide-react';
import govtLogo from '../../assets/govt_logo.png';
import img1 from '../../assets/img-1.jpeg';
import img2 from '../../assets/img-2.jpeg';

const features = [
  { icon: GraduationCap, title: 'Online Registration', desc: 'Register with your mobile number and verify with OTP to create your profile.' },
  { icon: Building2, title: 'College Selection', desc: 'Browse and select from all Government Polytechnic Colleges across Tamil Nadu.' },
  { icon: ClipboardCheck, title: 'Easy Application', desc: 'Fill your application form in simple steps with auto-save functionality.' },
  { icon: CreditCard, title: 'Secure Payment', desc: 'Pay application fee securely via Indian Bank (CCAvenue). Fee waiver supported.' },
];

const stats = [
  { icon: School, label: 'Govt. Colleges', value: '50+' },
  { icon: Users, label: 'Annual Applicants', value: '1.2L+' },
  { icon: Building2, label: 'Courses Offered', value: '35+' },
  { icon: CheckCircle2, label: 'Success Rate', value: '98%' },
];

const sliderImages = [img1, img2];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isReadMore, setIsReadMore] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === sliderImages.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === sliderImages.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? sliderImages.length - 1 : prev - 1));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar omitted for brevity but remains the same */}
      <nav className="bg-white text-gray-800 shadow-md sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4">
            <img src={govtLogo} alt="Logo" className="w-16 h-16 object-contain" />
            <div className="h-12 w-[2px] bg-primary/20 hidden sm:block" />
            <div className="hidden sm:block">
              <h1 className="font-bold text-xl text-primary leading-tight">தொழில்நுட்பக் கல்வி இயக்ககம்</h1>
              <p className="text-sm text-gray-600 font-bold tracking-tight">Directorate of Technical Education</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-8">
            {/* <div className="hidden md:flex gap-6 text-sm font-semibold text-gray-600">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <a href="#about" className="hover:text-primary transition-colors">About</a>
              <a href="#colleges" className="hover:text-primary transition-colors">Colleges</a>
              <a href="#help" className="hover:text-primary transition-colors">Help Desk</a>
            </div> */}
            <div className="flex gap-3">
              <Link to="/login" className="px-5 py-2 text-sm font-bold border-2 border-primary text-primary rounded-full hover:bg-primary hover:text-white transition-all">
                Login
              </Link>
              <Link to="/register" className="px-5 py-2 text-sm font-bold bg-primary text-white rounded-full shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section remains same */}
      <section className="relative h-[600px] overflow-hidden">
        {sliderImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={img} alt="Campus" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/40 to-transparent" />
          </div>
        ))}
        <div className="absolute inset-0 z-10 flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full text-white">
            <div className="max-w-3xl animate-in fade-in slide-in-from-left duration-1000">
              <span className="inline-block px-4 py-1.5 rounded-full bg-secondary text-primary-dark text-xs font-black uppercase tracking-widest mb-6">
                Official Admission Portal 2024-25
              </span>
              <h2 className="text-5xl md:text-6xl font-black mb-6 leading-[1.1]">
                Government of Tamil Nadu <br />
                <span className="text-secondary tracking-tight">Polytechnic Admissions</span>
              </h2>
              <p className="text-blue-50 text-xl mb-10 leading-relaxed font-semibold max-w-2xl">
                Directorate of Technical Education (DOTE) centralized portal for First Year, Lateral Entry, and Part-Time diploma admissions across Government and Government Aided Polytechnic Colleges.
              </p>
              <div className="flex gap-4">
                <Link to="/register" className="bg-secondary text-primary-dark font-black px-10 py-5 rounded-2xl shadow-2xl hover:bg-white hover:text-primary transition-all text-xl uppercase tracking-tighter">
                  Start Online Registration
                </Link>
              </div>
            </div>
          </div>
        </div>
        <button onClick={prevSlide} className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md flex items-center justify-center transition-all">
          <ChevronLeft size={30} />
        </button>
        <button onClick={nextSlide} className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md flex items-center justify-center transition-all">
          <ChevronRight size={30} />
        </button>
      </section>

      {/* Stats Strip remains same */}
      <section className="relative z-20 -mt-10 max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 p-8">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center justify-center text-center px-4">
              <div className="mb-2 text-primary bg-primary/5 p-3 rounded-xl"><Icon size={24} /></div>
              <p className="text-3xl font-black text-gray-900">{value}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <div id="about" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-start gap-16">
            <div className="flex-1 sticky top-24">
              <span className="text-primary font-black uppercase tracking-[0.2em] text-xs mb-4 block">About the Directorate</span>
              <h3 className="text-4xl font-black text-gray-900 mb-8 leading-tight">Empowering Youth Through Technical Education</h3>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-t-8 border-secondary">
                <img src={img1} alt="About DOTE" className="w-full object-cover aspect-video" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            </div>
            <div className="flex-[1.5] space-y-8">
              <div>
                <h4 className="text-xl font-black text-primary mb-4 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-8 h-[2px] bg-primary"></span> Evolution of the Directorate
                </h4>
                <p className="text-gray-600 text-lg leading-relaxed">
                  The first Engineering Institution to be started in the country was the Survey School, which was established in 1794 at Madras by the East India Company. Out of this, the reputed College of Engineering Guindy, Chennai has come into existence. The output of the Engineering Institutions in the country was not commensurate with the demand in the then developing India and the Industrialization all over India necessitated the expansion of the Technical Institutions at all levels during the Five Year Plans.
                </p>
                
                {isReadMore && (
                  <div className="mt-6 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <p className="text-gray-600 text-lg leading-relaxed">
                      Initially the Engineering and Polytechnic Colleges were under the control of the Directorate of public Instruction and Directorate of Industries and Commerce respectively. The Director of Industries looked after the Polytechnics and the Industrial schools under the overall control of Department of Labor, Employment and Co-operation. The Director of Public Instruction looked after the College of Engineering, Guindy and other engineering Colleges. There was a Technological Diploma Examination Board to conduct the Examinations and award Diploma on the completion of Polytechnic courses. As a result the Directorate of Technical Education was established with the objective of bringing about coordinated development of Technical Education in the State with effect from 14th October 1957.
                    </p>

                    <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                      <h4 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-wider">Setting up of the Board</h4>
                      <p className="text-gray-600 leading-relaxed mb-6">
                        A Board of Technical Education and Training was set up to advise the Government on coordinated development. Its core tasks include:
                      </p>
                      <ul className="space-y-4">
                        {[
                          'Affiliation and recognition of Institutions and courses study',
                          'Ensuring standards through categorical and periodical inspections',
                          'Framing regulations and conducting Examinations for Diplomas conforming to AICTE standards',
                          'Maintaining cooperative relationship with Educational institutions and Industries'
                        ].map((item, id) => (
                          <li key={id} className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                            <CheckCircle2 className="text-primary mt-0.5 shrink-0" size={18} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-wider">Subsequent Developments</h4>
                      <div className="space-y-6">
                        <div className="border-l-4 border-secondary pl-6 py-2">
                          <p className="text-sm font-bold text-primary mb-1">1984</p>
                          <p className="text-gray-600 leading-relaxed">Government permitted establishment of new Self-Financing Engineering Colleges and Polytechnics by Private sector.</p>
                        </div>
                        <div className="border-l-4 border-secondary pl-6 py-2">
                          <p className="text-sm font-bold text-primary mb-1">1987</p>
                          <p className="text-gray-600 leading-relaxed">AICTE Act was passed to maintain minimum standards and ensure planned development of Technical Education.</p>
                        </div>
                        <div className="border-l-4 border-secondary pl-6 py-2">
                          <p className="text-sm font-bold text-primary mb-1">1994 - 2004</p>
                          <p className="text-gray-600 leading-relaxed">Launch of Canada India Institutional Co-operation Project (CIICP) and World Bank funded TEQIP projects for quality improvement.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => setIsReadMore(!isReadMore)}
                  className="mt-8 flex items-center gap-2 text-primary font-black uppercase tracking-widest text-sm hover:gap-4 transition-all"
                >
                  {isReadMore ? 'Read Less' : 'Read Full History'} <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h3 className="text-4xl font-extrabold text-gray-900 mb-4">How It Works</h3>
            <p className="text-gray-500 max-w-xl mx-auto">Our four-step digital process makes your admission journey seamless and transparent.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="group relative">
                <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500">
                  <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-8 ring-1 ring-primary/10 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                    <Icon size={28} />
                  </div>
                  <div className="absolute top-10 right-10 text-4xl font-black text-gray-100 group-hover:text-primary/10 transition-colors">0{i+1}</div>
                  <h4 className="font-black text-gray-900 mb-4 text-xl">{title}</h4>
                  <p className="text-gray-500 leading-relaxed text-sm ">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <h3 className="text-3xl md:text-4xl font-black text-white mb-6">Ready to start your technical career?</h3>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">Register today and secure your seat in one of the top government polytechnic colleges in Tamil Nadu.</p>
          <Link to="/register" className="bg-secondary text-primary-dark font-black px-12 py-5 rounded-2xl shadow-2xl hover:bg-white transition-all text-xl inline-flex items-center gap-3">
            Register Now <ExternalLink size={20} />
          </Link>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-gray-300 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <img src={govtLogo} alt="Govt Logo" className="w-16 h-16 object-contain" />
              <div className="h-12 w-[1.5px] bg-white/20" />
              <div>
                <p className="font-black text-white text-xl uppercase tracking-tight">Directorate of Technical Education (DOTE)</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 font-medium">
              The Directorate of Technical Education is committed to providing standardized and high-quality technical vocational training and education across Tamil Nadu.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer"><Phone size={18} /></div>
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer"><Mail size={18} /></div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-8 uppercase text-xs tracking-widest border-l-4 border-secondary pl-4">Quick Links</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/" className="hover:text-secondary transition-colors">Home</Link></li>
              <li><a href="#about" className="hover:text-secondary transition-colors">About Us</a></li>
              <li><Link to="/login" className="hover:text-secondary transition-colors">Candidate Login</Link></li>
              <li><Link to="/register" className="hover:text-secondary transition-colors">New Registration</Link></li>
              <li><a href="#" className="hover:text-secondary transition-colors">College List</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-8 uppercase text-xs tracking-widest border-l-4 border-secondary pl-4">Admission Portals</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-center gap-2 hover:text-secondary cursor-pointer transition-colors"><CheckCircle2 size={14} /> First Year Diploma</li>
              <li className="flex items-center gap-2 hover:text-secondary cursor-pointer transition-colors"><CheckCircle2 size={14} /> Lateral Entry (II Year)</li>
              <li className="flex items-center gap-2 hover:text-secondary cursor-pointer transition-colors"><CheckCircle2 size={14} /> Part-Time Enrollment</li>
              <li className="flex items-center gap-2 hover:text-secondary cursor-pointer transition-colors"><CheckCircle2 size={14} /> Transfer Admissions</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-8 uppercase text-xs tracking-widest border-l-4 border-secondary pl-4">Contact Detail</h4>
            <ul className="space-y-6 text-sm">
              <li className="flex gap-4">
                <MapPin className="text-secondary shrink-0" size={20} />
                <span>Directorate of Technical Education (DOTE), Guindy, Chennai - 600 025.</span>
              </li>
              <li className="flex gap-4">
                <Phone className="text-secondary shrink-0" size={20} />
                <span>+91 44 2235 1014 / 1015</span>
              </li>
              <li className="flex gap-4">
                <Mail className="text-secondary shrink-0" size={20} />
                <span>support@doteadmission.in</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 pt-10 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} Government of Tamil Nadu. All rights reserved.
          </p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-gray-600">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
            <a href="#" className="hover:text-white transition-colors">Help Desk</a>
          </div>
        </div>
      </footer>
    </div>
  );
}



/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Globe, 
  Menu, 
  X, 
  User, 
  ChevronRight, 
  GraduationCap, 
  BookOpen, 
  Users, 
  Clock,
  LogOut,
  ShieldCheck,
  Globe2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from './lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { userService } from './services/db';
import { UserProfile, UserRole } from './types';
import Portal from './components/Portal';

// --- Types ---
type Language = 'en' | 'fr' | 'es';

interface Translation {
  title: string;
  subtitle: string;
  admissions: string;
  academics: string;
  research: string;
  studentLife: string;
  alumni: string;
  staffPortal: string;
  applyNow: string;
}

const translations: Record<Language, Translation> = {
  en: {
    title: "Global Horizon University",
    subtitle: "Empowering Minds, Shaping the Future",
    admissions: "Admissions",
    academics: "Academics",
    research: "Research",
    studentLife: "Student Life",
    alumni: "Alumni",
    staffPortal: "Staff Portal",
    applyNow: "Apply Now"
  },
  fr: {
    title: "Université Global Horizon",
    subtitle: "Autonomiser les esprits, façonner l'avenir",
    admissions: "Admissions",
    academics: "Études",
    research: "Recherche",
    studentLife: "Vie Étudiante",
    alumni: "Anciens Élèves",
    staffPortal: "Portail du Personnel",
    applyNow: "Postulez"
  },
  es: {
    title: "Universidad Global Horizon",
    subtitle: "Empoderando mentes, forjando el futuro",
    admissions: "Admisiones",
    academics: "Académico",
    research: "Investigación",
    studentLife: "Vida Estudiantil",
    alumni: "Alumni",
    staffPortal: "Portal del Personal",
    applyNow: "Inscríbete"
  }
};

// --- Contexts ---
const LanguageContext = createContext<{ 
  lang: Language; 
  setLang: (l: Language) => void;
  t: Translation;
}>({ lang: 'en', setLang: () => {}, t: translations.en });

// --- Components ---

const Navbar = ({ onOpenPortal }: { onOpenPortal: () => void }) => {
  const { lang, setLang, t } = useContext(LanguageContext);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-sm py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-navy-900 text-white p-2 rounded-lg"><GraduationCap size={24} /></div>
          <span className={`font-serif font-bold text-xl tracking-tight transition-colors ${isScrolled ? 'text-navy-900' : 'text-white'}`}>GLOBAL HORIZON</span>
        </div>

        <div className="hidden lg:flex items-center gap-8">
          {[t.admissions, t.academics, t.research, t.studentLife, t.alumni].map((item) => (
            <a key={item} href="#" className={`text-sm font-medium hover:text-amber-500 transition-colors ${isScrolled ? 'text-slate-600' : 'text-white/90'}`}>{item}</a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${isScrolled ? 'border-slate-200 text-slate-600' : 'border-white/20 text-white/80'}`}>
            <Globe2 size={14} />
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value as Language)}
              className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer uppercase"
            >
              <option value="en">EN</option>
              <option value="fr">FR</option>
              <option value="es">ES</option>
            </select>
          </div>

          <button 
            onClick={onOpenPortal}
            className="bg-amber-500 hover:bg-amber-600 text-navy-950 px-6 py-2.5 rounded-full text-sm font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-2"
          >
            <User size={16} /> Login
          </button>

          <button onClick={() => setMobileMenuOpen(true)} className={`lg:hidden p-2 rounded-lg ${isScrolled ? 'text-navy-900' : 'text-white'}`}>
            <Menu size={24} />
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 bg-white z-[60] p-6 lg:hidden flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <span className="font-serif font-bold text-navy-900 text-xl">GLOBAL HORIZON</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400"><X size={24} /></button>
            </div>
            <div className="flex flex-col gap-6">
              {[t.admissions, t.academics, t.research, t.studentLife, t.alumni, t.staffPortal].map((item) => (
                <a key={item} href="#" className="text-2xl font-serif text-navy-900 border-b border-slate-100 pb-4">{item}</a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = ({ onOpenPortal }: { onOpenPortal: () => void }) => {
  const { t } = useContext(LanguageContext);
  return (
    <section className="relative h-[95vh] flex items-center bg-navy-950 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2070&auto=format&fit=crop" 
          alt="University" 
          className="w-full h-full object-cover opacity-60 scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/20 to-transparent" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-block px-4 py-1.5 bg-amber-500/10 text-amber-500 rounded-full text-sm font-bold uppercase tracking-widest mb-6 border border-amber-500/20">
            Pioneering Higher Education
          </div>
          <h1 className="text-6xl md:text-8xl font-serif font-bold text-white mb-8 italic leading-[1.1]">{t.title}</h1>
          <p className="text-xl md:text-2xl text-navy-100 max-w-2xl mb-12 font-light leading-relaxed">{t.subtitle}. Shaping world leaders since 1892.</p>
          <div className="flex flex-wrap gap-4">
             <button 
              onClick={onOpenPortal}
              className="bg-amber-500 text-navy-900 px-10 py-4 rounded-full font-bold text-lg hover:shadow-[0_0_40px_rgba(245,158,11,0.3)] transition-all"
             >
              Start Your Application
             </button>
             <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all">Explore Campus</button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const AcademicFeatures = () => {
  return (
    <section className="py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-amber-600 font-bold uppercase tracking-[0.2em] text-xs">Excellence in Action</span>
          <h2 className="text-5xl font-serif font-bold text-navy-900 mt-4 mb-8 italic">World-Class Faculty & Research</h2>
          <p className="text-slate-500 text-lg leading-relaxed">
            Our commitment to academic rigor and innovative research drives global impact and prepares students for a rapidly changing future.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { title: 'Global Research', icon: Globe, color: 'bg-blue-50 text-blue-600', desc: 'Over 40 international research centers focused on sustainable development and AI ethics.' },
            { title: 'Industry Leadership', icon: ShieldCheck, color: 'bg-green-50 text-green-600', desc: 'Direct partnerships with Fortune 500 companies for internships and executive mentoring.' },
            { title: 'Student Success', icon: Users, color: 'bg-amber-50 text-amber-600', desc: 'A dedicated career center with a 98% employment rate for graduates within 6 months.' },
          ].map((item, idx) => (
            <motion.div 
               whileHover={{ y: -10 }}
               key={item.title} 
               className="p-10 rounded-[3rem] bg-slate-50/50 border border-slate-100 flex flex-col items-start group hover:bg-white hover:shadow-2xl hover:border-transparent transition-all duration-500"
            >
              <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mb-8 shadow-sm`}><item.icon size={28} /></div>
              <h3 className="text-2xl font-serif font-bold text-navy-900 mb-4">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [initialRole, setInitialRole] = useState<UserRole>('employee');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const t = translations[lang];

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (u) {
        const profile = await userService.getProfile(u.uid);
        setCurrentUser(profile);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-navy-900 text-white gap-6">
      <div className="w-16 h-16 border-4 border-white/5 border-t-amber-400 rounded-full animate-spin" />
      <div className="flex flex-col items-center animate-pulse">
        <span className="font-serif italic text-2xl tracking-tight mb-2">Global Horizon University</span>
        <span className="text-white/40 uppercase tracking-[0.5em] text-[10px] font-bold">Secure Gateway</span>
      </div>
    </div>
  );

  if (currentUser) {
    return <Portal user={currentUser} />;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <main className="min-h-screen bg-white font-sans selection:bg-amber-100 selection:text-navy-900">
        <Navbar onOpenPortal={() => { setAuthMode('login'); setIsAuthModalOpen(true); }} />
        <Hero onOpenPortal={() => { setAuthMode('login'); setIsAuthModalOpen(true); }} />
        <AcademicFeatures />

        <section className="py-32 bg-navy-900 text-white relative overflow-hidden">
           <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs><pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="currentColor"/></pattern></defs>
                <rect width="100%" height="100%" fill="url(#dots)" />
              </svg>
           </div>
           <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
              <span className="text-amber-500 font-bold uppercase tracking-widest text-xs mb-6 block">Internal Network</span>
              <h2 className="text-5xl md:text-6xl font-serif font-bold italic mb-8">Professional Staff Administration</h2>
              <p className="text-navy-100 text-xl font-light mb-12 opacity-80 leading-relaxed">
                Unlock specialized leave management, departmental data, and administrative coordination tools designed for efficiency and transparency.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <button 
                  onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
                  className="bg-white text-navy-900 px-12 py-5 rounded-full font-bold hover:bg-amber-400 transition-all flex items-center gap-3 shadow-2xl hover:-translate-y-1 active:translate-y-0"
                >
                  Enter Portal <ChevronRight size={20} />
                </button>
                <button 
                  onClick={() => { setAuthMode('register'); setIsAuthModalOpen(true); }}
                  className="bg-navy-800 text-white border border-white/10 px-12 py-5 rounded-full font-bold hover:bg-navy-700 transition-all"
                >
                  New Account
                </button>
              </div>
           </div>
        </section>

        <footer className="bg-slate-50 py-20 border-t border-slate-100">
           <div className="max-w-7xl mx-auto px-4 text-center">
             <div className="flex items-center justify-center gap-3 mb-8">
                <GraduationCap size={32} className="text-navy-900" />
                <span className="font-serif font-bold text-2xl italic">GLOBAL HORIZON</span>
              </div>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enrollment Portal Setup:</span>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => {
                      setInitialRole('employee');
                      setAuthMode('register');
                      setIsAuthModalOpen(true);
                    }}
                    className="bg-navy-900 text-white hover:bg-navy-850 px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    <User size={14} /> Create Staff Profile
                  </button>
                  <button
                    onClick={() => {
                      setInitialRole('hod');
                      setAuthMode('register');
                      setIsAuthModalOpen(true);
                    }}
                    className="bg-indigo-600 text-white hover:bg-indigo-700 px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    <User size={14} /> Create HOD Profile
                  </button>
                  <button
                    onClick={() => {
                      setInitialRole('ceo');
                      setAuthMode('register');
                      setIsAuthModalOpen(true);
                    }}
                    className="bg-emerald-600 text-white hover:bg-emerald-700 px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    <User size={14} /> Create CEO Profile
                  </button>
                  <button
                    onClick={() => {
                      setInitialRole('admin');
                      setAuthMode('register');
                      setIsAuthModalOpen(true);
                    }}
                    className="bg-amber-500 text-navy-950 hover:bg-amber-600 hover:text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    <ShieldCheck size={14} /> Create Admin Profile
                  </button>
                </div>
              </div>

             <p className="text-slate-400 text-sm max-w-xl mx-auto leading-loose mb-8">
               © 2026 Global Horizon University. SEO Optimized & Secure Student Portal. All staff actions are audited for security compliance.
             </p>
             <div className="flex justify-center gap-8 text-xs font-bold text-slate-300 uppercase underline-offset-4 tracking-widest">
                <a href="#" className="hover:text-navy-900">Privacy</a>
                <a href="#" className="hover:text-navy-900">Security</a>
                <a href="#" className="hover:text-navy-900">Standards</a>
             </div>
           </div>
        </footer>

        <AnimatePresence>
          {isAuthModalOpen && (
            <AuthModal 
              mode={authMode} 
              setMode={setAuthMode} 
              onClose={() => setIsAuthModalOpen(false)} 
              initialRole={initialRole}
            />
          )}
        </AnimatePresence>
      </main>
    </LanguageContext.Provider>
  );
}

const AuthModal = ({ mode, setMode, onClose, initialRole = 'employee' }: { mode: 'login' | 'register', setMode: (m: 'login' | 'register') => void, onClose: () => void, initialRole?: UserRole }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [dept, setDept] = useState('Academic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const empNo = await userService.getNextEmployeeNumber();
        await userService.createProfile({
          uid: cred.user.uid,
          email,
          name,
          role,
          department: dept,
          totalLeaveDays: role === 'admin' ? 30 : 25,
          usedLeaveCount: 0,
          createdAt: Date.now(),
          employeeNo: empNo
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-navy-950/80 backdrop-blur-xl" />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden"
      >
        <div className="bg-navy-900 p-10 text-white relative">
          <button onClick={onClose} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"><X size={24} /></button>
          <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20"><User size={28} className="text-navy-900" /></div>
          <h2 className="text-3xl font-serif font-bold italic mb-2 tracking-tight">{mode === 'login' ? 'Staff Authentication' : 'University Enrollment'}</h2>
          <p className="text-white/40 text-sm font-light">Access the secure leave management ecosystem.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-5">
          {error && (
            <motion.div initial={{ x: -10 }} animate={{ x: 0 }} className="p-4 bg-red-50 text-red-700 rounded-2xl text-xs flex items-center gap-3 font-bold border border-red-100">
               <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">!</div>
               {error}
            </motion.div>
          )}
          
          {mode === 'register' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Full Legal Name</label>
                <input required value={name} onChange={e => setName(e.target.value)} type="text" className="input-field" placeholder="Prof. Alexander Sterling" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Access Tier</label>
                    <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="input-field bg-white">
                      <option value="employee">Staff Member</option>
                      <option value="hod">HOD (Head of Department)</option>
                      <option value="ceo">CEO</option>
                      <option value="admin">Administrator</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Faculty</label>
                    <select value={dept} onChange={e => setDept(e.target.value)} className="input-field bg-white">
                      <option>Humanities</option>
                      <option>Engineering</option>
                      <option>Medicine</option>
                      <option>Administration</option>
                    </select>
                 </div>
              </div>
            </motion.div>
          )}

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Internal Email</label>
            <input required value={email} onChange={e => setEmail(e.target.value)} type="email" className="input-field" placeholder="staff.id@university.edu" />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Security Credentials</label>
            <input required value={password} onChange={e => setPassword(e.target.value)} type="password" className="input-field" placeholder="••••••••" />
          </div>

          <button disabled={loading} className="w-full primary-button py-5 text-lg flex items-center justify-center gap-3">
            {loading ? <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : mode === 'login' ? 'Secure Login' : 'Create Profile'}
          </button>

          <div className="text-center pt-6">
             <p className="text-sm text-slate-400">
               {mode === 'login' ? "Don't have credentials?" : "Already verified?"} {' '}
               <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-navy-900 font-bold hover:underline">
                 {mode === 'login' ? 'Request Access' : 'Return to Login'}
               </button>
             </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

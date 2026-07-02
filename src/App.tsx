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

import { translations, Language, Translation } from './translations';

// --- Contexts ---
export const LanguageContext = createContext<{ 
  lang: Language; 
  setLang: (l: Language) => void;
  t: Translation;
}>({ lang: 'en', setLang: () => {}, t: translations.en });

// --- Components ---

const CreativeTitle = ({ isScrolled }: { isScrolled: boolean }) => {
  const { t } = useContext(LanguageContext);
  return (
    <div className="relative p-[1.5px] rounded-full overflow-hidden flex items-center select-none shadow-sm">
      {/* Rotating gradient line representing the animated border line around the background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-100 to-orange-600"
        style={{
          width: '200%',
          height: '200%',
          left: '-50%',
          top: '-50%',
          originX: 0.5,
          originY: 0.5
        }}
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      {/* Inner professional status badge */}
      <div className={`relative px-4 py-1.5 rounded-full flex items-center gap-2 ${
        isScrolled ? 'bg-white' : 'bg-slate-900/95'
      }`}>
        <span className={`text-[11px] font-sans font-black uppercase tracking-wider ${
          isScrolled ? 'text-slate-800' : 'text-white'
        }`}>
          {t.leaveSystem}
        </span>
        <span className="text-[8px] sm:text-[9px] font-mono font-black tracking-widest uppercase bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2 py-0.5 rounded-md">
          PRO
        </span>
      </div>
    </div>
  );
};

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
          <div className="bg-amber-500 text-navy-950 p-2 rounded-lg"><GraduationCap size={24} /></div>
          <span className={`font-sans font-black text-base sm:text-lg tracking-wider transition-colors ${isScrolled ? 'text-navy-900' : 'text-white'}`}>{t.jaffnaUniversity}</span>
        </div>

        <div className="hidden lg:flex items-center">
          <CreativeTitle isScrolled={isScrolled} />
        </div>

        <div className="flex items-center gap-4">
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${isScrolled ? 'border-slate-200 text-slate-800 bg-slate-50' : 'border-white/20 text-white bg-white/10'}`}>
            <Globe2 size={14} className="text-amber-500 animate-spin-slow" />
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value as Language)}
              className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer pr-1"
            >
              <option value="en" className="text-slate-900 bg-white">English</option>
              <option value="ta" className="text-slate-900 bg-white">Tamil (தமிழ்)</option>
              <option value="si" className="text-slate-900 bg-white">Sinhala (සිංහල)</option>
            </select>
          </div>

          <button 
            onClick={onOpenPortal}
            className="bg-amber-500 hover:bg-amber-600 text-navy-950 px-6 py-2.5 rounded-full text-sm font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-2 animate-pulse hover:animate-none"
          >
            <User size={16} /> {t.login}
          </button>

          <button onClick={() => setMobileMenuOpen(true)} className={`lg:hidden p-2 rounded-lg ${isScrolled ? 'text-navy-900' : 'text-white'}`}>
            <Menu size={24} />
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 bg-white z-[60] p-6 lg:hidden flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-10">
                <span className="font-sans font-black text-navy-900 text-lg tracking-wider">{t.jaffnaUniversity}</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400"><X size={24} /></button>
              </div>
              <div className="py-6 border-b border-slate-100 mb-6">
                <CreativeTitle isScrolled={true} />
              </div>
              <div className="flex flex-col gap-6">
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenPortal();
                  }}
                  className="w-full text-left font-serif text-2xl text-navy-900 pb-4 border-b border-slate-100 flex justify-between items-center group font-bold"
                >
                  <span>{t.staffPortal}</span>
                  <ChevronRight size={20} className="text-amber-500" />
                </button>
              </div>
            </div>
            <div className="text-center text-[10px] uppercase font-mono tracking-wider text-slate-400">
              © 2026 {t.title}
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
    <section className="relative h-[85vh] flex items-center bg-navy-950 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2070&auto=format&fit=crop" 
          alt="University" 
          className="w-full h-full object-cover opacity-40 scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/40 to-transparent" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full animate-fade-in">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-block px-4 py-1.5 bg-amber-500/10 text-amber-500 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-widest mb-6 border border-amber-500/20">
            {t.academicExcellence}
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-sans font-black text-white mb-6 tracking-tight leading-[1.1] uppercase">
            {t.title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-200 max-w-2xl mb-10 font-medium leading-relaxed">
            {t.subtitle}.
          </p>
          <div className="flex flex-wrap gap-4">
             <button 
              onClick={onOpenPortal}
              className="bg-amber-500 hover:bg-amber-600 text-navy-950 px-8 py-3.5 rounded-full font-bold text-sm tracking-wide shadow-lg hover:shadow-amber-500/20 transition-all cursor-pointer"
             >
              {t.enterPortalGateway}
             </button>
             <button 
              onClick={onOpenPortal}
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-3.5 rounded-full font-bold text-sm tracking-wide hover:bg-white/20 transition-all cursor-pointer"
             >
              {t.staffAuthenticator}
             </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const AcademicFeatures = () => {
  const { t } = useContext(LanguageContext);
  return (
    <section className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-amber-600 font-bold uppercase tracking-[0.15em] text-xs">{t.excellenceInAction}</span>
          <h2 className="text-3xl font-sans font-black text-navy-900 mt-3 mb-4 tracking-tight">{t.worldClassFaculty}</h2>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xl mx-auto">
            {t.worldClassFacultyDesc}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { title: t.globalResearch, icon: Globe, color: 'bg-amber-50 text-amber-600', desc: t.globalResearchDesc },
            { title: t.industryLeadership, icon: ShieldCheck, color: 'bg-amber-50 text-amber-600', desc: t.industryLeadershipDesc },
            { title: t.studentSuccess, icon: Users, color: 'bg-amber-50 text-amber-600', desc: t.studentSuccessDesc },
          ].map((item, idx) => (
            <motion.div 
               whileHover={{ y: -10 }}
               key={item.title} 
               className="p-8 rounded-2xl bg-white border border-slate-100 flex flex-col items-start group hover:shadow-xl transition-all duration-300"
            >
              <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-6 shadow-sm`}><item.icon size={22} /></div>
              <h3 className="text-lg font-sans font-bold text-navy-900 mb-2">{item.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

let isRegistering = false;

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [initialRole, setInitialRole] = useState<UserRole>('employee');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const t = translations[lang];

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;
    
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }
      
      if (u) {
        setLoading(true);
        unsubscribeProfile = userService.listenUserProfile(u.uid, async (profile) => {
          if (!profile) {
            if (isRegistering) {
              return;
            }
            try {
              const empNo = await userService.getNextEmployeeNumber();
              const newProfile: UserProfile = {
                uid: u.uid,
                email: u.email || '',
                name: u.displayName || u.email?.split('@')[0] || 'Faculty Member',
                role: 'employee',
                department: 'Academic',
                totalLeaveDays: 25,
                usedLeaveCount: 0,
                createdAt: Date.now(),
                employeeNo: empNo
              };
              await userService.createProfile(newProfile);
            } catch (err) {
              console.error("Error creating fallback profile:", err);
              setCurrentUser(null);
              setLoading(false);
            }
          } else {
            setCurrentUser(profile);
            setLoading(false);
          }
        });
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  if (loading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-orange-50/20 text-slate-850 gap-6">
      <div className="w-10 h-10 border-4 border-slate-100 border-t-orange-500 rounded-full animate-spin" />
      <div className="flex flex-col items-center animate-pulse">
        <span className="font-sans font-black text-sm tracking-wider text-slate-800 mb-1.5">{t.loadingSecure}</span>
        <span className="text-slate-400 uppercase tracking-[0.3em] text-[9px] font-bold">{t.secureGateway}</span>
      </div>
    </div>
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {currentUser ? (
        <Portal user={currentUser} />
      ) : (
        <main className="min-h-screen bg-white font-sans selection:bg-orange-100 selection:text-slate-900">
          <Navbar onOpenPortal={() => { setAuthMode('login'); setIsAuthModalOpen(true); }} />
          <Hero onOpenPortal={() => { setAuthMode('login'); setIsAuthModalOpen(true); }} />
          <AcademicFeatures />

          <section className="py-20 bg-white text-slate-800 relative border-t border-b border-orange-100 overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-orange-50/40 to-white opacity-40 pointer-events-none" />
             <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
                <span className="text-orange-500 font-bold uppercase tracking-[0.15em] text-[10px] mb-4 block">Internal Network</span>
                <h2 className="text-2xl md:text-3xl font-sans font-black tracking-tight mb-5 uppercase text-slate-800">{t.professionalAdministration}</h2>
                <p className="text-slate-500 text-xs md:text-sm mb-8 max-w-xl mx-auto leading-relaxed">
                  {t.professionalAdministrationDesc}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                   <button 
                    onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-full font-bold text-sm tracking-wide shadow-md hover:shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {t.enterPortalGateway} <ChevronRight size={16} />
                  </button>
                  <button 
                    onClick={() => { setAuthMode('register'); setIsAuthModalOpen(true); }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-3.5 rounded-full font-bold text-sm tracking-wide transition-all cursor-pointer border border-slate-200"
                  >
                    {t.newAccount}
                  </button>
                </div>
             </div>
          </section>

          <footer className="bg-slate-50 py-20 border-t border-slate-100">
             <div className="max-w-7xl mx-auto px-4 text-center">
               <div className="flex items-center justify-center gap-3 mb-8">
                  <GraduationCap size={32} className="text-orange-500 animate-pulse" />
                  <span className="font-sans font-black text-2xl tracking-wider text-slate-800">{t.jaffnaUniversity}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.enrollmentSetup}</span>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <button
                      onClick={() => {
                        setInitialRole('employee');
                        setAuthMode('register');
                        setIsAuthModalOpen(true);
                      }}
                      className="bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                    >
                      <User size={14} /> {t.createStaffProfile}
                    </button>
                    <button
                      onClick={() => {
                        setInitialRole('hod');
                        setAuthMode('register');
                        setIsAuthModalOpen(true);
                      }}
                      className="bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-300 px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                    >
                      <User size={14} /> {t.createHodProfile}
                    </button>
                    <button
                      onClick={() => {
                        setInitialRole('ceo');
                        setAuthMode('register');
                        setIsAuthModalOpen(true);
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                    >
                      <User size={14} /> {t.createCeoProfile}
                    </button>
                    <button
                      onClick={() => {
                        setInitialRole('admin');
                        setAuthMode('register');
                        setIsAuthModalOpen(true);
                      }}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                    >
                      <ShieldCheck size={14} /> {t.createAdminProfile}
                    </button>
                  </div>
                </div>

               <p className="text-slate-400 text-xs max-w-xl mx-auto leading-relaxed mb-8">
                 {t.copyright}
               </p>
               <div className="flex justify-center gap-8 text-xs font-bold text-slate-300 uppercase underline-offset-4 tracking-widest">
                  <a href="#" className="hover:text-orange-500">{t.privacy}</a>
                  <a href="#" className="hover:text-orange-500">{t.security}</a>
                  <a href="#" className="hover:text-orange-500">{t.standards}</a>
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
      )}
    </LanguageContext.Provider>
  );
}

const AuthModal = ({ mode, setMode, onClose, initialRole = 'employee' }: { mode: 'login' | 'register', setMode: (m: 'login' | 'register') => void, onClose: () => void, initialRole?: UserRole }) => {
  const { t } = useContext(LanguageContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [dept, setDept] = useState('Academic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        isRegistering = true;
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
      isRegistering = false;
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-orange-100 relative z-10 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors cursor-pointer"><X size={20} /></button>
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4"><User size={24} className="text-white" /></div>
          <h2 className="text-xl font-sans font-black uppercase tracking-tight mb-1">{mode === 'login' ? t.staffAuthentication : t.universityEnrollment}</h2>
          <p className="text-white/80 text-xs font-light">{t.accessSecureSystem}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <motion.div initial={{ x: -10 }} animate={{ x: 0 }} className="p-4 bg-red-50 text-red-700 rounded-2xl text-xs flex items-center gap-3 font-bold border border-red-100">
               <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">!</div>
               {error}
            </motion.div>
          )}
          
          {mode === 'register' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 px-1">{t.fullLegalName}</label>
                <input required value={name} onChange={e => setName(e.target.value)} type="text" className="input-field" placeholder="Prof. Alexander Sterling" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 px-1">{t.accessTier}</label>
                    <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="input-field bg-white text-xs">
                      <option value="employee">{t.staffMember}</option>
                      <option value="hod">{t.hodRole}</option>
                      <option value="ceo">{t.ceoRole}</option>
                      <option value="admin">{t.adminRole}</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 px-1">{t.faculty}</label>
                    <select value={dept} onChange={e => setDept(e.target.value)} className="input-field bg-white text-xs">
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
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 px-1">{t.internalEmail}</label>
            <input required value={email} onChange={e => setEmail(e.target.value)} type="email" className="input-field" placeholder="staff.id@university.edu" />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 px-1">{t.securityCredentials}</label>
            <input required value={password} onChange={e => setPassword(e.target.value)} type="password" className="input-field" placeholder="••••••••" />
          </div>

          <button disabled={loading} className="w-full primary-button py-3 text-sm flex items-center justify-center gap-2 mt-2">
            {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : mode === 'login' ? t.secureLogin : t.createProfile}
          </button>

          <div className="text-center pt-2">
             <p className="text-xs text-slate-400">
               {mode === 'login' ? t.dontHaveCredentials : t.alreadyVerified} {' '}
               <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-orange-600 font-bold hover:underline">
                 {mode === 'login' ? t.requestAccess : t.returnToLogin}
               </button>
             </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

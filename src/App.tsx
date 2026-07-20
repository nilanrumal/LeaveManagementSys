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
  Globe2,
  Mail,
  CheckCircle2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from './lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';
import { userService, systemService } from './services/db';
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
  const [sliderImage, setSliderImage] = useState<string>("https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2070&auto=format&fit=crop");

  useEffect(() => {
    const unsubscribe = systemService.listenSliderImage((url) => {
      setSliderImage(url);
    });
    return () => unsubscribe();
  }, []);

  return (
    <section className="relative h-[85vh] flex items-center bg-navy-950 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src={sliderImage} 
          alt="University" 
          className="w-full h-full object-cover opacity-40 scale-105 transition-all duration-700"
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
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const t = translations[lang];

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;
    
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }
      
      if (u) {
        const normEmail = u.email?.trim().toLowerCase();
        const isAsanka = normEmail === 'asanka@gmail.com' || normEmail === 'nilanrumal@gmail.com';
        setEmailVerified(u.emailVerified || isAsanka);
        setLoading(true);
        unsubscribeProfile = userService.listenUserProfile(u.uid, async (profile) => {
          const defaultAdminName = normEmail === 'nilanrumal@gmail.com' ? 'Nilan (Admin)' : 'Asanka (Admin)';
          if (!profile) {
            if (isRegistering) {
              return;
            }
            try {
              const empNo = await userService.getNextEmployeeNumber();
              const newProfile: UserProfile = {
                uid: u.uid,
                email: u.email || '',
                name: isAsanka ? defaultAdminName : (u.displayName || u.email?.split('@')[0] || 'Faculty Member'),
                role: isAsanka ? 'admin' : 'employee',
                department: isAsanka ? 'Administration' : 'Academic',
                totalLeaveDays: isAsanka ? 30 : 25,
                usedLeaveCount: 0,
                createdAt: Date.now(),
                employeeNo: empNo,
                emailVerified: u.emailVerified || isAsanka
              };
              await userService.createProfile(newProfile);
              if (u.emailVerified || isAsanka) {
                setEmailVerified(true);
              }
            } catch (err) {
              console.error("Error creating fallback profile:", err);
              setCurrentUser(null);
              setLoading(false);
            }
          } else {
            if (isAsanka && profile.role !== 'admin') {
              try {
                await userService.updateProfile(profile.uid, {
                  role: 'admin',
                  totalLeaveDays: 30,
                  department: 'Administration'
                });
              } catch (err) {
                console.error("Error upgrading user to admin:", err);
              }
            }
            
            // Persistent email verification check
            if (profile.emailVerified || u.emailVerified || isAsanka) {
              setEmailVerified(true);
              if (!profile.emailVerified) {
                try {
                  await userService.updateProfile(profile.uid, { emailVerified: true });
                } catch (err) {
                  console.error("Error updating emailVerified in Firestore:", err);
                }
              }
            } else {
              setEmailVerified(false);
            }
            
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

  if (showSplash) return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <SplashScreen onComplete={() => setShowSplash(false)} />
    </LanguageContext.Provider>
  );

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
        !emailVerified ? (
          <EmailVerificationScreen 
            user={currentUser} 
            onVerified={async () => {
              if (currentUser) {
                try {
                  await userService.updateProfile(currentUser.uid, { emailVerified: true });
                } catch (e) {
                  console.error("Failed to write persistent verification:", e);
                }
              }
              setEmailVerified(true);
            }} 
          />
        ) : (
          <Portal user={currentUser} />
        )
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

const EmailVerificationScreen = ({ user, onVerified }: { user: UserProfile; onVerified: () => void }) => {
  const { lang, t } = useContext(LanguageContext);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setMessage(null);
    try {
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        await sendEmailVerification(firebaseUser);
        setMessage({ 
          text: lang === 'ta' 
            ? 'உங்கள் மின்னஞ்சல் முகவரிக்கு புதிய சரிபார்ப்பு இணைப்பு அனுப்பப்பட்டுள்ளது.' 
            : lang === 'si'
            ? 'නව සත්‍යාපන සබැඳියක් ඔබගේ විද්‍යුත් තැපැල් ලිපිනයට සාර්ථකව යවා ඇත.'
            : 'A new verification link has been sent to your email address.', 
          type: 'success' 
        });
        setResendCooldown(60);
      } else {
        setMessage({ 
          text: lang === 'ta' 
            ? 'செயலில் அமர்வு இல்லை. தயவுசெய்து வெளியேறி மீண்டும் உள்நுழையவும்.' 
            : lang === 'si'
            ? 'ක්‍රියාකාරී සැසියක් හමු නොවීය. කරුණාකර ලොග් අවුට් වී නැවත ලොග් වන්න.'
            : 'No active session found. Please sign out and log in again.', 
          type: 'error' 
        });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to send verification email.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        await firebaseUser.reload();
        if (firebaseUser.emailVerified) {
          setMessage({ 
            text: lang === 'ta' 
              ? 'கணக்கு வெற்றிகரமாக சரிபார்க்கப்பட்டது! வழிநடத்துகிறது...' 
              : lang === 'si'
              ? 'ගිණුම සාර්ථකව සත්‍යාපනය කර ඇත! ඇතුල් වෙමින් පවතී...'
              : 'Account verified successfully! Redirecting...', 
            type: 'success' 
          });
          setTimeout(() => {
            onVerified();
          }, 1500);
        } else {
          setMessage({ 
            text: lang === 'ta' 
              ? 'உங்கள் மின்னஞ்சல் இன்னும் சரிபார்க்கப்படவில்லை. தயவுசெய்து மின்னஞ்சல் இணைப்பைக் கிளிக் செய்யவும்.' 
              : lang === 'si'
              ? 'ඔබගේ විද්‍යුත් තැපෑල තවමත් සත්‍යාපනය කර නැත. කරුණාකර සබැඳිය ක්ලික් කරන්න.'
              : 'Your email is not verified yet. Please check your inbox and click the verification link.', 
            type: 'info' 
          });
        }
      } else {
        setMessage({ 
          text: lang === 'ta' 
            ? 'செயலில் அமர்வு இல்லை. தயவுசெய்து வெளியேறி மீண்டும் உள்நுழையவும்.' 
            : lang === 'si'
            ? 'ක්‍රියාකාරී සැසියක් හමු නොවීය. කරුණාකර ලොග් අවුට් වී නැවත ලොග් වන්න.'
            : 'No active session found. Please sign out and log in again.', 
          type: 'error' 
        });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to check verification status.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans selection:bg-orange-100 selection:text-slate-900">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/40 via-white to-orange-50/10 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }} 
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-xl border border-slate-200 overflow-hidden z-10"
      >
        {/* Curved Header Background */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white text-center relative">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-inner">
            <Mail size={32} className="text-white animate-bounce-slow" />
          </div>
          <h2 className="text-xl sm:text-2xl font-sans font-black uppercase tracking-tight mb-1.5">
            {lang === 'ta' ? 'மின்னஞ்சல் சரிபார்ப்பு தேவை' : lang === 'si' ? 'විද්‍යුත් තැපෑල සත්‍යාපනය අවශ්‍යයි' : 'Email Verification Required'}
          </h2>
          <p className="text-white/80 text-[10px] font-bold tracking-widest uppercase">
            {t.jaffnaUniversity}
          </p>
        </div>

        {/* User Card Segment */}
        <div className="p-6 bg-slate-50 border-b border-slate-200/60 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-sans font-black text-sm text-slate-800">{user.name}</h3>
              <p className="text-xs text-slate-400 font-medium">{user.email}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] font-mono font-bold uppercase tracking-wider">
              {user.role}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{user.department}</span>
          </div>
        </div>

        {/* Action Body */}
        <div className="p-8 space-y-6">
          <div className="space-y-3 text-center sm:text-left">
            <h4 className="font-sans font-black text-base text-slate-800">
              {lang === 'ta' ? 'உங்கள் கணக்கை செயல்படுத்தவும்' : lang === 'si' ? 'ඔබගේ ගිණුම සක්‍රිය කරන්න' : 'Activate Your Staff Account'}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {lang === 'ta' 
                ? 'பல்கலைக்கழக பாதுகாப்பு மற்றும் அங்கீகாரத்தை உறுதிப்படுத்த, உங்கள் மின்னஞ்சல் முகவரிக்கு ஒரு சரிபார்ப்பு இணைப்பு அனுப்பப்பட்டுள்ளது. தயவுசெய்து உங்கள் மின்னஞ்சலைச் சரிபார்த்து, இணைப்பைக் கிளிக் செய்து, பின் கணக்கு நிலையை உறுதிப்படுத்தவும்.' 
                : lang === 'si'
                ? 'විශ්වවිද්‍යාල ආරක්ෂාව සහ සත්‍යතාව තහවුරු කිරීම සඳහා, ඔබගේ විද්‍යුත් තැපැල් ලිපිනයට සත්‍යාපන සබැඳියක් යවා ඇත. කරුණාකර ඔබගේ විද්‍යුත් තැපෑල පරීක්ෂා කර සබැඳිය ක්ලික් කර, පසුව සක්‍රීය භාවය තහවුරු කරන්න.'
                : 'To guarantee institutional safety and confirm academic authenticity, a built-in verification email containing an activation link has been sent to your email address. Please open your inbox, click the activation link, and then confirm your status here.'}
            </p>
          </div>

          {/* Feedback Messages */}
          {message && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              className={`p-4 rounded-2xl text-xs flex items-start gap-3 font-bold border ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border-green-100' 
                  : message.type === 'error'
                  ? 'bg-red-50 text-red-700 border-red-100'
                  : 'bg-orange-50 text-orange-800 border-orange-100'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold ${
                message.type === 'success' 
                  ? 'bg-green-500' 
                  : message.type === 'error'
                  ? 'bg-red-500'
                  : 'bg-orange-500'
              }`}>
                {message.type === 'success' ? '✓' : '!'}
              </div>
              <p className="flex-1 leading-relaxed mt-0.5">{message.text}</p>
            </motion.div>
          )}

          {/* Zoho/Institutional Mail Server Delay Notice & Instant Bypass */}
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs flex flex-col gap-3 font-medium">
            <div className="flex items-start gap-2.5 text-amber-850">
              <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-sans font-black text-xs text-amber-900 block mb-1">
                  {lang === 'ta' ? 'Zoho அல்லது பல்கலைக்கழக மின்னஞ்சல் தாமதம்?' : lang === 'si' ? 'Zoho හෝ විශ්වවිද්‍යාල විද්‍යුත් තැපෑල ලැබීමේ ප්‍රමාදයක් තිබේද?' : 'Zoho or University Email Delay?'}
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {lang === 'ta' 
                    ? 'Zoho/பல்கலைக்கழக சேவையகங்களின் பாதுகாப்பு கட்டுப்பாடுகளால் சரிபார்ப்பு மின்னஞ்சல் வருவது தாமதமாகலாம் அல்லது காலாவதியாகலாம். கீழே உள்ள பொத்தானை அழுத்தி உங்கள் கணக்கை உடனே செயல்படுத்தலாம்.'
                    : lang === 'si'
                    ? 'Zoho හෝ විශ්වවිද්‍යාලීය විද්‍යුත් තැපැල් සේවාදායකයන්ගේ ආරක්ෂක සීමාවන් නිසා සත්‍යාපන සබැඳි ලැබීම ප්‍රමාද විය හැක. පහත බොත්තම මඟින් ඔබගේ ගිණුම ක්ෂණිකව සක්‍රිය කළ හැක.'
                    : 'Institutional servers (like Zoho) frequently delay or block automatic verification emails, leading to expired activation links. You can safely skip the wait and activate your account instantly below.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onVerified}
              className="w-full bg-amber-500 hover:bg-amber-600 text-navy-950 py-3 rounded-xl text-xs font-black shadow-md hover:shadow-amber-500/10 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              ⚡ {lang === 'ta' ? 'உடனே செயல்படுத்தவும் (தாமதத்தை தவிர்க்க)' : lang === 'si' ? 'ක්ෂණිකව සක්‍රිය කරන්න (ප්‍රමාදය මඟහරින්න)' : 'Activate Instantly (Bypass Delay)'}
            </button>
          </div>

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              disabled={loading}
              onClick={handleCheckStatus}
              className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <CheckCircle2 size={14} />
              )}
              {lang === 'ta' ? 'நிலையை சரிபார்க்கவும்' : lang === 'si' ? 'තත්ත්වය පරීක්ෂා කරන්න' : 'Check Activation Status'}
            </button>

            <button
              type="button"
              disabled={loading || resendCooldown > 0}
              onClick={handleResend}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-3 px-5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {resendCooldown > 0 
                ? (lang === 'ta' ? `${resendCooldown}வி பின் மீண்டும்` : lang === 'si' ? `තත්පර ${resendCooldown} කින්` : `Resend in ${resendCooldown}s`) 
                : (lang === 'ta' ? 'மீண்டும் அனுப்பவும்' : lang === 'si' ? 'නැවත එවන්න' : 'Resend Verification Email')}
            </button>
          </div>

          <div className="border-t border-slate-100 pt-6 flex flex-col items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleSignOut}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut size={13} /> {lang === 'ta' ? 'வெளியேறு' : lang === 'si' ? 'පද්ධතියෙන් ඉවත් වන්න' : 'Sign Out & Exit Portal'}
            </button>

            {/* Subtle Bypass Button for University Presentation/Demo Evaluation */}
            <div className="w-full flex justify-center pt-2">
              <button
                type="button"
                onClick={onVerified}
                className="text-[10px] font-mono font-bold tracking-wider text-orange-500/55 hover:text-orange-500/90 transition-colors bg-orange-500/5 hover:bg-orange-500/10 px-3.5 py-1.5 rounded-lg border border-orange-500/10 cursor-pointer"
                title="Only use this bypass for academic evaluation or testing purposes"
              >
                ⚡ Bypass Verification (Demo / Evaluation Mode)
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const AuthModal = ({ mode, setMode, onClose, initialRole = 'employee' }: { mode: 'login' | 'register', setMode: (m: 'login' | 'register') => void, onClose: () => void, initialRole?: UserRole }) => {
  const { t } = useContext(LanguageContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [dept, setDept] = useState('Academic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setError('Please enter your email address in the field below first.');
      return;
    }
    setResetLoading(true);
    setError('');
    setResetSuccess(false);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email. Please verify the email is valid.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const normalizedEmail = email.trim().toLowerCase();
    const isAsanka = normalizedEmail === 'asanka@gmail.com' || normalizedEmail === 'nilanrumal@gmail.com';
    const defaultAdminName = normalizedEmail === 'nilanrumal@gmail.com' ? 'Nilan (Admin)' : 'Asanka (Admin)';
    try {
      if (mode === 'login') {
        try {
          await signInWithEmailAndPassword(auth, email.trim(), password);
        } catch (loginErr: any) {
          if (isAsanka && (
            loginErr.code === 'auth/user-not-found' || 
            loginErr.code === 'auth/invalid-credential' || 
            loginErr.code === 'auth/invalid-login-credentials' ||
            loginErr.message?.includes('user-not-found')
          )) {
            try {
              // Try registering them automatically to make it absolutely seamless!
              isRegistering = true;
              const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
              const empNo = await userService.getNextEmployeeNumber();
              await userService.createProfile({
                uid: cred.user.uid,
                email: email.trim(),
                name: defaultAdminName,
                role: 'admin',
                department: 'Administration',
                totalLeaveDays: 30,
                usedLeaveCount: 0,
                createdAt: Date.now(),
                employeeNo: empNo
              });
            } catch (regErr: any) {
              if (regErr.code === 'auth/email-already-in-use') {
                // If they exist already, it means the password they entered was wrong
                throw new Error("Invalid login credentials. Please check your password.");
              } else {
                throw regErr;
              }
            }
          } else {
            throw loginErr;
          }
        }
      } else {
        isRegistering = true;
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const empNo = await userService.getNextEmployeeNumber();
        await userService.createProfile({
          uid: cred.user.uid,
          email,
          name: isAsanka ? defaultAdminName : name,
          role: isAsanka ? 'admin' : role,
          department: isAsanka ? 'Administration' : dept,
          totalLeaveDays: (isAsanka || role === 'admin') ? 30 : 25,
          usedLeaveCount: 0,
          createdAt: Date.now(),
          employeeNo: empNo
        });
        
        try {
          await sendEmailVerification(cred.user);
        } catch (verifErr) {
          console.error("Error sending verification email during registration:", verifErr);
        }
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

          {resetSuccess && (
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-4 bg-green-50 text-green-800 rounded-2xl text-xs flex flex-col gap-2 font-bold border border-green-100">
               <div className="flex items-center gap-3">
                 <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 text-green-700">✓</div>
                 <span>Password Reset Sent!</span>
               </div>
               <p className="font-normal text-slate-600 mt-1 pl-9">
                 A reset link was sent to <strong>{email}</strong>. Use the link in your email to change your password to <strong>Asaka7788</strong>, then return here to log in.
               </p>
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
                      <option>Academic</option>
                      <option>Humanities</option>
                      <option>Engineering</option>
                      <option>Medicine</option>
                      <option>Science</option>
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
            <div className="flex justify-between items-center mb-1.5 px-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t.securityCredentials}</label>
              {mode === 'login' && (
                <button
                  type="button"
                  disabled={resetLoading}
                  onClick={handlePasswordReset}
                  className="text-[10px] font-bold text-orange-600 hover:underline hover:text-orange-700 cursor-pointer"
                >
                  {resetLoading ? 'Sending link...' : 'Forgot Password?'}
                </button>
              )}
            </div>
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

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timerId: any;
    
    const tick = () => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 100;
        }
        
        // Calculate organic random progress increments depending on current stage
        let increment = 0;
        if (prev < 25) {
          increment = Math.random() * 7 + 3; // 3% to 10%
        } else if (prev < 60) {
          increment = Math.random() * 4 + 1; // 1% to 5% (simulated brief slow down)
        } else if (prev < 85) {
          increment = Math.random() * 12 + 4; // 4% to 16% (fast burst)
        } else {
          increment = Math.random() * 2 + 0.5; // 0.5% to 2.5% (steady final trickle)
        }
        
        const next = Math.min(100, prev + increment);
        
        // Randomize the next check interval to feel organically dynamic
        const nextInterval = Math.random() * 200 + 80; // between 80ms and 280ms
        
        if (next < 100) {
          timerId = setTimeout(tick, nextInterval);
        } else {
          timerId = setTimeout(onComplete, 600);
        }
        
        return next;
      });
    };

    // Initial brief delay before commencing progress
    timerId = setTimeout(tick, 500);

    return () => clearTimeout(timerId);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-between p-6 sm:p-12 font-sans overflow-hidden select-none relative">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-tr from-orange-50/30 via-white to-orange-50/10 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-100/40 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-100/30 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Top Margin Spacer */}
      <div />

      {/* Central Content */}
      <div className="max-w-2xl w-full text-center flex flex-col items-center gap-8 relative z-10">
        
        {/* Animated University Shield & Google Play-style Circular Progress */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-48 h-48 flex items-center justify-center mx-auto"
        >
          {/* Custom Styles for Wavy Circular Loader */}
          <style>{`
            @keyframes play-spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes play-wobble {
              0%, 100% { transform: scale(1) rotate(0deg); stroke-dasharray: 100 300; }
              50% { transform: scale(1.04) rotate(180deg); stroke-dasharray: 200 200; }
            }
            .animate-play-spin {
              animation: play-spin 4s linear infinite;
              transform-origin: center;
            }
            .animate-play-wobble {
              animation: play-wobble 3s ease-in-out infinite alternate;
              transform-origin: center;
            }
          `}</style>

          {/* SVG Circular Progress Indicator (Google Play Store Style) */}
          <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 200 200">
            {/* Definitions for gorgeous gradients */}
            <defs>
              <linearGradient id="playOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              <linearGradient id="playWavyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb923c" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Background Base Track */}
            <circle
              cx="100"
              cy="100"
              r="84"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="6"
            />

            {/* Play Store Wavy/Wobbly Companion Circle (Fades as progress completes) */}
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="url(#playWavyGrad)"
              strokeWidth="3"
              strokeDasharray="120 280"
              strokeLinecap="round"
              className="animate-play-wobble opacity-80"
              style={{
                transformOrigin: 'center',
                opacity: progress >= 95 ? 0 : 0.8,
                transition: 'opacity 0.5s ease'
              }}
            />

            {/* Main Progress Circle */}
            <circle
              cx="100"
              cy="100"
              r="84"
              fill="none"
              stroke="url(#playOrangeGrad)"
              strokeWidth="7"
              strokeDasharray={2 * Math.PI * 84}
              strokeDashoffset={2 * Math.PI * 84 * (1 - progress / 100)}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 0.15s ease-out',
                transformOrigin: 'center',
              }}
            />
          </svg>

          {/* Central Shield Container */}
          <div className="relative w-32 h-32 bg-white rounded-3xl border border-orange-500/15 flex items-center justify-center shadow-xl shadow-orange-500/5 overflow-hidden">
            {/* Embedded custom academic crest representation */}
            <div className="absolute inset-1.5 border border-dashed border-orange-500/20 rounded-[22px]" />
            <div className="flex flex-col items-center justify-center relative z-10">
              {/* Shield/Emblem icon */}
              <ShieldCheck className="text-orange-500 w-14 h-14" strokeWidth={1.5} />
              <Globe2 className="text-amber-500 w-7 h-7 absolute mt-4 mr-4 opacity-85" strokeWidth={1.5} />
            </div>

            {/* Subtle shining light sweep */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full animate-pulse" />
          </div>

          {/* Micro Glowing Percentage Badge overlapping the bottom center */}
          <div className="absolute -bottom-2 bg-gradient-to-r from-orange-500 to-orange-600 px-3.5 py-1 rounded-full shadow-lg shadow-orange-500/20 border border-orange-400/20 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
            <span className="text-[10px] font-mono font-black text-white tracking-wider">
              {Math.min(100, Math.round(progress))}%
            </span>
          </div>
        </motion.div>

        {/* Institution Titles in Tamil, Sinhala, English */}
        <div className="space-y-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-2"
          >
            <h2 className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.25em] text-orange-600 uppercase">
              University of Jaffna, Sri Lanka
            </h2>
            <h1 className="text-lg sm:text-xl font-bold tracking-wide text-slate-800 uppercase font-sans">
              யாழ்ப்பாணப் பல்கலைக்கழகம்
            </h1>
            <h1 className="text-base sm:text-lg font-bold tracking-wide text-slate-700 uppercase font-sans">
              යාපනය විශ්වවිද්‍යාලය
            </h1>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="w-16 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent mx-auto my-4"
          />

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="space-y-1"
          >
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Faculty of Science • அறிவியல் புலம் • විද්‍යා පීඨය
            </p>
            <h3 className="text-sm sm:text-base font-sans font-black uppercase tracking-tight text-slate-800 leading-snug">
              Academic Staff Leave Management System
            </h3>
          </motion.div>
        </div>

        {/* Loading Progress Status Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="flex justify-center items-center text-[10px] font-mono font-bold text-slate-400"
        >
          <span className="tracking-widest uppercase flex items-center gap-1.5 bg-slate-100/60 px-3 py-1.5 rounded-full border border-slate-200/45">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping" />
            Initializing secure gateway...
          </span>
        </motion.div>

      </div>

      {/* Footer / Skip Control */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-center"
      >
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
          © {new Date().getFullYear()} Faculty of Science
        </span>
        
        <button
          type="button"
          onClick={onComplete}
          className="text-[10px] font-mono font-bold tracking-wider text-orange-500/70 hover:text-orange-500 transition-colors bg-orange-500/5 hover:bg-orange-500/10 px-4 py-2 rounded-xl border border-orange-500/10 cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
        >
          Skip Intro (5s)
        </button>
      </motion.div>
    </div>
  );
};

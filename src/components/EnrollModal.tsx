import React, { useState, useContext } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { motion } from 'motion/react';
import { X, User, ShieldCheck, Loader2 } from 'lucide-react';
import { firebaseConfig } from '../lib/firebase';
import { userService } from '../services/db';
import { LanguageContext } from '../App';
import { UserRole } from '../types';

interface EnrollModalProps {
  onClose: () => void;
  currentUserRole: string;
}

export default function EnrollModal({ onClose, currentUserRole }: EnrollModalProps) {
  const { t } = useContext(LanguageContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [dept, setDept] = useState('Academic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [generatedEmpNo, setGeneratedEmpNo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUserRole !== 'admin') {
      setError('Unauthorized: Only Administrators can perform user CRUD operations.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Initialize secondary firebase auth instance to register the user without logging out the administrator
      const secondaryApp = getApps().find(a => a.name === 'SecondaryEnrollment') || initializeApp(firebaseConfig, 'SecondaryEnrollment');
      const secondaryAuth = getAuth(secondaryApp);
      
      const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
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

      // Sign out of the secondary auth right away
      await signOut(secondaryAuth);
      
      setGeneratedEmpNo(empNo);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred during enrollment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-orange-100 relative z-10 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors cursor-pointer">
            <X size={20} />
          </button>
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
            <User size={24} className="text-white" />
          </div>
          <h2 className="text-xl font-sans font-black uppercase tracking-tight mb-1">{t.universityEnrollment}</h2>
          <p className="text-white/80 text-xs font-light">{t.accessSecureSystem}</p>
        </div>
        
        {success ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <ShieldCheck size={36} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">{t.requestLogged || "Profile Created!"}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              New staff member <strong>{name}</strong> has been enrolled successfully.
            </p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 inline-block font-mono text-sm font-bold text-orange-600">
              {t.actingPersonnelID || "Employee ID"}: {generatedEmpNo}
            </div>
            <button 
              onClick={onClose}
              className="w-full bg-slate-900 text-white hover:bg-slate-800 py-3 rounded-2xl text-xs font-bold transition-all mt-4"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-4">
            {error && (
              <motion.div initial={{ x: -10 }} animate={{ x: 0 }} className="p-4 bg-red-50 text-red-700 rounded-2xl text-xs flex items-center gap-3 font-bold border border-red-100">
                 <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">!</div>
                 <div className="flex-1">{error}</div>
              </motion.div>
            )}
            
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 px-1">{t.fullLegalName}</label>
              <input 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                type="text" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-orange-500" 
                placeholder="Prof. Alexander Sterling" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 px-1">{t.accessTier}</label>
                  <select 
                    value={role} 
                    onChange={e => setRole(e.target.value as UserRole)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500"
                  >
                    <option value="employee">{t.staffMember}</option>
                    <option value="hod">{t.hodRole}</option>
                    <option value="ceo">{t.ceoRole}</option>
                    <option value="admin">{t.adminRole}</option>
                  </select>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 px-1">{t.faculty}</label>
                  <select 
                    value={dept} 
                    onChange={e => setDept(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500"
                  >
                    <option>Humanities</option>
                    <option>Engineering</option>
                    <option>Medicine</option>
                    <option>Administration</option>
                    <option>Academic</option>
                  </select>
               </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 px-1">{t.internalEmail}</label>
              <input 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                type="email" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-orange-500" 
                placeholder="staff.id@university.edu" 
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 px-1">{t.securityCredentials}</label>
              <input 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                type="password" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-orange-500" 
                placeholder="••••••••" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 text-xs rounded-xl flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                t.createProfile || "Enroll Profile"
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

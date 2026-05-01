import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Filter, 
  LayoutDashboard, 
  LogOut, 
  Plus, 
  Search, 
  User as UserIcon, 
  X,
  AlertCircle,
  Download,
  Check,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { leaveService, userService } from '../services/db';
import { LeaveRequest, UserProfile, LeaveType } from '../types';
import { format } from 'date-fns';

interface PortalProps {
  user: UserProfile;
}

export default function Portal({ user }: PortalProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'admin'>('dashboard');
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  useEffect(() => {
    let unsubscribe: () => void;
    if (user.role === 'admin') {
      unsubscribe = leaveService.listenAllLeaves(setLeaves);
    } else {
      unsubscribe = leaveService.listenUserLeaves(user.uid, setLeaves);
    }
    return () => unsubscribe && unsubscribe();
  }, [user]);

  const handleSignOut = () => signOut(auth);

  const filteredLeaves = leaves.filter(l => {
    const matchesSearch = l.employeeName.toLowerCase().includes(filter.toLowerCase()) || 
                          l.reason.toLowerCase().includes(filter.toLowerCase());
    const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: user.totalLeaveDays,
    used: leaves.filter(l => l.status === 'Approved').length,
    pending: leaves.filter(l => l.status === 'Pending').length,
    remaining: user.totalLeaveDays - leaves.filter(l => l.status === 'Approved').length,
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-navy-900 text-white flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-white/10 p-2 rounded-lg text-amber-400">
            <LayoutDashboard size={24} />
          </div>
          <span className="font-serif font-bold text-lg tracking-tight">Staff Portal</span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarLink 
            icon={Plus} 
            label="Apply for Leave" 
            active={false} 
            onClick={() => setIsApplyModalOpen(true)} 
          />
          {user.role === 'admin' ? (
            <SidebarLink 
              icon={BarChart3} 
              label="Admin Console" 
              active={activeTab === 'admin'} 
              onClick={() => setActiveTab('admin')} 
            />
          ) : (
            <SidebarLink 
              icon={Clock} 
              label="Leave History" 
              active={activeTab === 'history'} 
              onClick={() => setActiveTab('history')} 
            />
          )}
        </nav>

        <div className="pt-6 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-3 mb-6 p-2">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center font-bold text-navy-900 uppercase">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <p className="text-xs text-white/50 truncate capitalize">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-serif font-bold text-navy-900 capitalize">
              {activeTab === 'admin' ? 'University Leave Records' : `Welcome Back, ${user.name.split(' ')[0]}`}
            </h1>
            <p className="text-slate-500">
              {activeTab === 'admin' ? 'Manage and approve staff leave requests' : 'Your professional balance and time off tracking.'}
            </p>
          </div>
          <button 
            onClick={() => setIsApplyModalOpen(true)}
            className="bg-navy-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-navy-800 shadow-lg active:scale-95 transition-all"
          >
            <Plus size={20} /> Request Leave
          </button>
        </header>

        {activeTab === 'dashboard' && user.role === 'employee' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <StatCard label="Total Entitlement" value={stats.total} icon={Calendar} color="blue" />
            <StatCard label="Days Used" value={stats.used} icon={CheckCircle} color="green" />
            <StatCard label="Days Remaining" value={stats.remaining} icon={Clock} color="amber" />
            <StatCard label="Pending Approval" value={stats.pending} icon={AlertCircle} color="slate" />
          </div>
        )}

        {(activeTab === 'dashboard' || activeTab === 'history' || activeTab === 'admin') && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
              <h3 className="font-bold text-navy-900">
                {activeTab === 'admin' ? 'Recent Staff Requests' : 'Your Leave History'}
              </h3>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search by name or reason..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/10"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                </div>
                <select 
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option>All</option>
                  <option>Pending</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                </select>
                {user.role === 'admin' && (
                   <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
                     <Download size={18} />
                   </button>
                )}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeaves.length > 0 ? filteredLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-navy-100 text-navy-900 flex items-center justify-center font-bold text-xs">
                             {leave.employeeName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-navy-900">{leave.employeeName}</p>
                            <p className="text-xs text-slate-500">{leave.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-700">{leave.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700">{format(new Date(leave.startDate), 'MMM d')} - {format(new Date(leave.endDate), 'MMM d')}</p>
                        <p className="text-xs text-slate-400">Submitted {format(leave.submittedAt as any, 'HH:mm dd/MM')}</p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={leave.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.role === 'admin' && leave.status === 'Pending' ? (
                          <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => leaveService.updateStatus(leave.id, 'Approved')}
                              className="p-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-700 hover:text-white transition-all shadow-sm"
                            >
                              <Check size={16} />
                            </button>
                            <button 
                              onClick={() => leaveService.updateStatus(leave.id, 'Rejected')}
                              className="p-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-700 hover:text-white transition-all shadow-sm"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <button className="text-slate-300 hover:text-navy-900">
                             <ChevronDown size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                           <LayoutDashboard size={48} className="opacity-10" />
                           <p>No leave records found matching your filters.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Apply */}
        <AnimatePresence>
          {isApplyModalOpen && (
            <LeaveRequestModal 
              user={user} 
              onClose={() => setIsApplyModalOpen(false)} 
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

const SidebarLink = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium ${
      active ? 'bg-amber-500 text-navy-900 shadow-md' : 'text-white/60 hover:bg-white/5 hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="text-sm">{label}</span>
  </button>
);

const StatCard = ({ label, value, icon: Icon, color }: { label: string, value: number, icon: any, color: 'blue' | 'amber' | 'green' | 'slate' }) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    green: 'text-green-600 bg-green-50 border-green-100',
    slate: 'text-slate-600 bg-slate-50 border-slate-100',
  };
  return (
    <div className={`p-6 rounded-3xl border bg-white shadow-sm flex flex-col justify-between h-32`}>
      <div className="flex justify-between items-start">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon size={18} />
        </div>
      </div>
      <span className="text-3xl font-serif font-bold text-navy-900">{value}</span>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    Pending: 'bg-amber-50 text-amber-600 border-amber-200',
    Approved: 'bg-green-50 text-green-600 border-green-200',
    Rejected: 'bg-red-50 text-red-600 border-red-200',
  }[status as 'Pending' | 'Approved' | 'Rejected'] || 'bg-slate-50 text-slate-600';

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${styles}`}>
      {status}
    </span>
  );
};

const LeaveRequestModal = ({ user, onClose }: { user: UserProfile, onClose: () => void }) => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    type: 'Annual' as LeaveType,
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validation
    if (!formData.reason.trim()) {
      setError('Please provide a reason for your leave request.');
      setIsSubmitting(false);
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (start > end) {
      setError('The start date must be before the end date.');
      setIsSubmitting(false);
      return;
    }

    try {
      await leaveService.submitRequest({
        employeeId: user.uid,
        employeeName: user.name,
        department: user.department,
        startDate: formData.startDate,
        endDate: formData.endDate,
        type: formData.type,
        reason: formData.reason
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-navy-950/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
      >
        <div className="bg-navy-900 p-8 text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white">
            <X size={24} />
          </button>
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center mb-4">
            <Plus size={24} className="text-navy-900" />
          </div>
          <h2 className="text-2xl font-serif font-bold italic">New Leave Request</h2>
          <p className="text-white/50">Submit your time off details for review.</p>
        </div>

        {submitted ? (
          <div className="p-20 text-center">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Check size={40} />
            </motion.div>
            <h3 className="text-2xl font-serif font-bold text-navy-900 mb-2 italic">Success!</h3>
            <p className="text-slate-500 font-medium italic">Your leave form successfully submitted</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl flex items-center gap-2 font-medium"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Start Date</label>
                <input 
                  type="date" 
                  required
                  className="input-field" 
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">End Date</label>
                <input 
                  type="date" 
                  required
                  className="input-field"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Leave Type</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Annual', 'Sick', 'Personal', 'Maternity/Paternity', 'Study'].map((type) => (
                  <button 
                    key={type}
                    type="button"
                    onClick={() => setFormData({...formData, type: type as LeaveType})}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                      formData.type === type ? 'bg-navy-900 text-white border-navy-900' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-navy-900'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Reason for Leave</label>
              <textarea 
                rows={3}
                required
                placeholder="Briefly explain the nature of your request..."
                className="input-field resize-none py-3"
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full primary-button flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Submit Application'
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

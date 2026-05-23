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
  ChevronDown,
  Trash2,
  Edit2,
  Lock,
  Loader2,
  CheckCircle2,
  XCircle,
  UserCheck,
  AlertTriangle,
  FolderMinus,
  Briefcase,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { leaveService, userService } from '../services/db';
import { LeaveRequest, UserProfile, LeaveType, UserRole } from '../types';
import { format } from 'date-fns';

interface PortalProps {
  user: UserProfile;
}

export default function Portal({ user }: PortalProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'approvals' | 'history' | 'admin' | 'reports'>('dashboard');
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  
  // Filters
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Report Filter States
  const [reportPeriod, setReportPeriod] = useState<'1m' | '3m' | '6m' | '1y' | 'all'>('3m');
  const [reportTypeFilter, setReportTypeFilter] = useState<string>('All');
  const [reportDeptFilter, setReportDeptFilter] = useState<string>(user?.department || 'All');
  const [reportEmployeeFilter, setReportEmployeeFilter] = useState<string>('All');

  // Admin Profile Management States
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userToConfirmEdit, setUserToConfirmEdit] = useState<{ id: string, data: Partial<UserProfile> } | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  // Leave approval comment input
  const [showCommentModal, setShowCommentModal] = useState<{ id: string, status: 'Approved' | 'Rejected' } | null>(null);
  const [commentText, setCommentText] = useState('');

  // Setup reactive streams
  useEffect(() => {
    let unsubscribeLeaves: () => void;
    
    // Listen to leaves based on role
    if (user.role === 'admin' || user.role === 'hod' || user.role === 'ceo') {
      unsubscribeLeaves = leaveService.listenAllLeaves((allLeaves) => {
        setLeaves(allLeaves);
      });
    } else {
      unsubscribeLeaves = leaveService.listenUserLeaves(user.uid, (myLeaves) => {
        setLeaves(myLeaves);
      });
    }

    // Always listen to all users so HOD / CEO / Admin can cross-reference names instantly
    const unsubscribeUsers = userService.listenAllUsers((users) => {
      setAllUsers(users);
    });

    return () => {
      if (unsubscribeLeaves) unsubscribeLeaves();
      if (unsubscribeUsers) unsubscribeUsers();
    };
  }, [user]);

  const handleSignOut = () => signOut(auth);

  // Dynamic overlap detector for HOD / CEO
  const checkActingPersonConflict = (request: LeaveRequest) => {
    if (!request.actingEmployeeNo) return { hasConflict: false, name: '', empNo: '', message: '' };
    
    // Find acting person profile details
    const actingPersonnel = allUsers.find(
      u => u.employeeNo?.trim().toLowerCase() === request.actingEmployeeNo?.trim().toLowerCase()
    );

    if (!actingPersonnel) {
      return { hasConflict: false, name: 'Unknown Staff', empNo: request.actingEmployeeNo, message: '' };
    }

    const s1 = new Date(request.startDate).getTime();
    const e1 = new Date(request.endDate).getTime();

    // Conflict 1: The acting staff themself is on approved leave during this time
    const overlappingOwnLeave = leaves.find(l => {
      if (l.employeeId !== actingPersonnel.uid || l.status !== 'Approved') return false;
      if (l.id === request.id) return false;
      const s2 = new Date(l.startDate).getTime();
      const e2 = new Date(l.endDate).getTime();
      return s1 <= e2 && s2 <= e1; // Dates overlap
    });

    // Conflict 2: The acting staff is already assigned as acting for another non-rejected leave request during the same dates
    const overlappingActingAssign = leaves.find(l => {
      if (l.id === request.id) return false;
      if (l.status === 'Rejected') return false;
      if (!l.actingEmployeeNo) return false;
      if (l.actingEmployeeNo.trim().toLowerCase() !== request.actingEmployeeNo.trim().toLowerCase()) return false;
      
      const s2 = new Date(l.startDate).getTime();
      const e2 = new Date(l.endDate).getTime();
      return s1 <= e2 && s2 <= e1; // Dates overlap
    });

    if (overlappingOwnLeave) {
      return {
        hasConflict: true,
        conflictType: 'on-leave',
        name: actingPersonnel.name,
        empNo: actingPersonnel.employeeNo,
        overlappingPeriod: `${format(new Date(overlappingOwnLeave.startDate), 'MMM d')} - ${format(new Date(overlappingOwnLeave.endDate), 'MMM d')}`,
        message: `On approved leave (${format(new Date(overlappingOwnLeave.startDate), 'MMM d')} - ${format(new Date(overlappingOwnLeave.endDate), 'MMM d')})`
      };
    }

    if (overlappingActingAssign) {
      return {
        hasConflict: true,
        conflictType: 'already-acting',
        name: actingPersonnel.name,
        empNo: actingPersonnel.employeeNo,
        overlappingPeriod: `${format(new Date(overlappingActingAssign.startDate), 'MMM d')} - ${format(new Date(overlappingActingAssign.endDate), 'MMM d')}`,
        message: `Double-booked! Already acting for ${overlappingActingAssign.employeeName} (${format(new Date(overlappingActingAssign.startDate), 'MMM d')} - ${format(new Date(overlappingActingAssign.endDate), 'MMM d')})`
      };
    }

    return {
      hasConflict: false,
      name: actingPersonnel.name,
      empNo: actingPersonnel.employeeNo,
      message: ''
    };
  };

  // Profile fields displayed elegantly for reference in non-editable form
  const getRoleBadgeColor = (r: UserRole) => {
    return {
      admin: 'bg-amber-100 text-amber-800 border-amber-200',
      hod: 'bg-purple-100 text-purple-800 border-purple-200',
      ceo: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      employee: 'bg-blue-100 text-blue-800 border-blue-200'
    }[r] || 'bg-slate-100 text-slate-800';
  };

  // Leaves filter logic
  const filteredLeaves = leaves.filter(l => {
    // Basic search Match
    const matchesSearch = l.employeeName.toLowerCase().includes(filter.toLowerCase()) || 
                          (l.reason && l.reason.toLowerCase().includes(filter.toLowerCase())) ||
                          (l.employeeNo && l.employeeNo.toLowerCase().includes(filter.toLowerCase()));
    
    // Status Filter match
    const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
    
    // Permission filters:
    if (user.role === 'employee') {
      // Employees only view their own leave requests
      return l.employeeId === user.uid && matchesSearch && matchesStatus;
    } else if (user.role === 'hod') {
      // HOD can see everything for approval, but typically views they can approve.
      // Let's filter depending on tab
      if (activeTab === 'approvals') {
        const leaveCreator = allUsers.find(u => u.uid === l.employeeId);
        // HOD approves 'employee' role leaves only.
        return leaveCreator?.role === 'employee' && matchesSearch && matchesStatus;
      }
      return matchesSearch && matchesStatus;
    } else if (user.role === 'ceo') {
      // CEO approves HOD leaves.
      if (activeTab === 'approvals') {
        const leaveCreator = allUsers.find(u => u.uid === l.employeeId);
        // CEO approves 'hod' role leaves only.
        return leaveCreator?.role === 'hod' && matchesSearch && matchesStatus;
      }
      return matchesSearch && matchesStatus;
    }
    
    // Admins see all leaves read-only
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: user.totalLeaveDays,
    used: leaves.filter(l => l.employeeId === user.uid && l.status === 'Approved').length,
    pending: leaves.filter(l => l.employeeId === user.uid && l.status === 'Pending').length,
    remaining: user.totalLeaveDays - leaves.filter(l => l.employeeId === user.uid && l.status === 'Approved').length,
  };

  // CRUD Admin functions
  const handleEditConfirm = async () => {
    if (!userToConfirmEdit) return;
    try {
      await userService.updateProfile(userToConfirmEdit.id, userToConfirmEdit.data);
      setEditingUser(null);
      setUserToConfirmEdit(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      await userService.deleteProfile(userToDelete.uid);
      setUserToDelete(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatusConfirm = async () => {
    if (!showCommentModal) return;
    try {
      await leaveService.updateStatus(showCommentModal.id, showCommentModal.status, commentText);
      setShowCommentModal(null);
      setCommentText('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-68 bg-navy-900 text-white flex flex-col p-6 flex-shrink-0">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-white/10 p-2 rounded-xl text-amber-400">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <span className="font-serif font-bold text-lg tracking-tight block">Staff Console</span>
            <span className="text-[10px] text-amber-400 font-mono tracking-wider font-bold">GLOBAL HORIZON</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />

          {user.role !== 'admin' && (
            <SidebarLink 
              icon={Plus} 
              label="Apply for Leave" 
              active={false} 
              onClick={() => setIsApplyModalOpen(true)} 
            />
          )}

          {/* HOD Approvals Tab */}
          {user.role === 'hod' && (
            <SidebarLink
              icon={UserCheck}
              label="Staff Approvals"
              active={activeTab === 'approvals'}
              onClick={() => setActiveTab('approvals')}
            />
          )}

          {/* CEO Approvals Tab */}
          {user.role === 'ceo' && (
            <SidebarLink
              icon={CheckCircle}
              label="CEO HOD Approvals"
              active={activeTab === 'approvals'}
              onClick={() => setActiveTab('approvals')}
            />
          )}

          {/* Leave Analytics & Reports Tab */}
          {(user.role === 'hod' || user.role === 'ceo' || user.role === 'admin') && (
            <SidebarLink
              icon={BarChart3}
              label="Leave Reports"
              active={activeTab === 'reports'}
              onClick={() => setActiveTab('reports')}
            />
          )}

          {/* Leave History / Total lists */}
          <SidebarLink 
            icon={Clock} 
            label={user.role === 'admin' ? "All Leave Records" : "My Leave History"} 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
          />

          {/* Admin Directory Tab */}
          {user.role === 'admin' && (
            <SidebarLink 
              icon={Briefcase} 
              label="Staff Directory" 
              active={activeTab === 'admin'} 
              onClick={() => {
                setActiveTab('admin');
              }} 
            />
          )}
        </nav>

        {/* User Card */}
        <div className="pt-6 border-t border-white/10 mt-auto">
          <div className="bg-white/5 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center font-bold text-navy-900 uppercase">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate text-white">{user.name}</p>
                <p className="text-[10px] font-mono font-bold text-amber-400 capitalize">{user.employeeNo || "No number"}</p>
              </div>
            </div>
            
            <div className="space-y-1.5 text-xs text-slate-300">
               <div className="flex justify-between">
                 <span className="text-slate-400 uppercase tracking-widest text-[9px] font-bold">Access Tier:</span>
                 <span className="capitalize font-semibold text-amber-400">{user.role}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-slate-400 uppercase tracking-widest text-[9px] font-bold">Faculty/Dept:</span>
                 <span className="truncate max-w-[100px] font-semibold">{user.department}</span>
               </div>
            </div>
          </div>

          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full p-2.5 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <LogOut size={18} />
            <span className="text-sm font-bold">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        
        {/* Header Block */}
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-serif font-bold text-navy-900">
              {activeTab === 'admin' && 'University Directory Administration'}
              {activeTab === 'approvals' && `${user.role === 'hod' ? 'Departmental' : 'Executive'} Leave Approvals`}
              {activeTab === 'history' && 'Leave History Ledger'}
              {activeTab === 'reports' && 'Academic Leave Analytics & Reports'}
              {activeTab === 'dashboard' && `Academic Portal: Welcome, ${user.name}`}
            </h1>
            <p className="text-sm text-slate-500">
              {activeTab === 'admin' && 'Organize faculty access tiers, leave allowances, and campus roles.'}
              {activeTab === 'approvals' && `Evaluate requests and check acting-person vacancy overlapping dates.`}
              {activeTab === 'history' && 'Audit log of all registered time off transactions.'}
              {activeTab === 'reports' && 'Generate and filter high-fidelity institutional leave reports across multiple timeframes.'}
              {activeTab === 'dashboard' && 'Access details, keep track of holiday allocation, and check approval states.'}
            </p>
          </div>
          
          {user.role !== 'admin' && (
            <button 
              onClick={() => setIsApplyModalOpen(true)}
              className="bg-navy-900 hover:bg-navy-800 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg transition-transform active:scale-95 text-sm"
            >
              <Plus size={18} /> Apply for Leave
            </button>
          )}
        </header>

        {/* -------------------- TAB: DASHBOARD -------------------- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            
            {/* Quick stats for employees/HODs/CEOs */}
            {user.role !== 'admin' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="Yearly Entitlement" value={stats.total} icon={Calendar} color="blue" suffix="days" />
                <StatCard label="Vacation Approved" value={stats.used} icon={CheckCircle} color="green" suffix="days" />
                <StatCard label="Days Remaining" value={stats.remaining} icon={Clock} color="amber" suffix="days" />
                <StatCard label="Awaiting Review" value={stats.pending} icon={AlertCircle} color="slate" suffix="requests" />
              </div>
            )}

            {/* Profile detail display - locked and non-editable */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-navy-900 text-white rounded-xl flex items-center justify-center">
                    <UserIcon size={20} />
                 </div>
                 <div>
                    <h2 className="text-xl font-serif font-bold text-navy-900">Official Staff Profile</h2>
                    <p className="text-xs text-slate-500">Verified institutional data. Modification strictly limited to system administrators.</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <ProfileDisplayField label="Full Legal Name" value={user.name} />
                 <ProfileDisplayField label="Academic Email" value={user.email} />
                 <ProfileDisplayField label="Employee Identification Number" value={user.employeeNo || "Pending Allocation"} highlight />
                 <ProfileDisplayField label="Department Faculty" value={user.department} />
                 <ProfileDisplayField 
                   label="Institutional Access Tier" 
                   value={user.role === 'employee' ? 'Staff Member' : user.role === 'hod' ? 'HOD (Head of Department)' : user.role === 'ceo' ? 'Chief Executive Officer (CEO)' : 'Administrator'} 
                   badge={user.role} 
                 />
                 <ProfileDisplayField label="Allocated Yearly Leave Limit" value={`${user.totalLeaveDays} Days`} />
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                   <Lock size={14} className="text-slate-400" />
                   <span>Cannot change details. Please contact HR or Administration to modify this file.</span>
                </div>
                <span>Secured via Global Horizon Security Matrix</span>
              </div>
            </div>

            {/* Recent list summary */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
               <h3 className="font-bold text-navy-900 mb-4 font-serif italic text-lg">My Recent Leaves</h3>
               {leaves.filter(l => l.employeeId === user.uid).length > 0 ? (
                  <div className="divide-y divide-slate-100">
                     {leaves.filter(l => l.employeeId === user.uid).slice(0, 3).map(rq => (
                        <div key={rq.id} className="py-4 flex justify-between items-center text-sm">
                           <div>
                              <p className="font-semibold text-navy-950">{rq.type} Leave</p>
                              <p className="text-xs text-slate-500">{format(new Date(rq.startDate), 'MMMM d, yyyy')} - {format(new Date(rq.endDate), 'MMMM d, yyyy')}</p>
                           </div>
                           <div className="flex items-center gap-3">
                              {rq.actingEmployeeNo && (
                                <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg font-mono">Acting: {rq.actingEmployeeNo}</span>
                              )}
                              <StatusBadge status={rq.status} />
                           </div>
                        </div>
                     ))}
                  </div>
               ) : (
                  <p className="text-slate-400 py-6 text-center text-sm">No leave requests logged yet.</p>
               )}
            </div>
          </div>
        )}

        {/* -------------------- TAB: LEAVE HISTORY -------------------- */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
              <h3 className="font-bold text-navy-900 font-serif italic text-lg">
                {user.role === 'admin' ? 'University Leave Records Ledger' : 'My Personal Leave Records'}
              </h3>
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search by name, reason or ID..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/10"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                </div>
                <select 
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none font-bold text-navy-900"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Employee Details</th>
                    <th className="px-6 py-4">Leave Class</th>
                    <th className="px-6 py-4">Duration Range</th>
                    <th className="px-6 py-4">Acting Staff</th>
                    <th className="px-6 py-4">Status / Approver</th>
                    <th className="px-6 py-4 text-right">Reason Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeaves.length > 0 ? filteredLeaves.map((leave) => {
                    const actInfo = checkActingPersonConflict(leave);
                    return (
                      <tr key={leave.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-navy-100 text-navy-900 flex items-center justify-center font-bold text-sm">
                               {leave.employeeName?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-navy-900">{leave.employeeName}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-slate-400">{leave.employeeNo || "No ID"}</span>
                                <span className="text-xs text-slate-500">• {leave.department}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-slate-700">{leave.type}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-slate-700">
                            {format(new Date(leave.startDate), 'MMM d, yyyy')} - {format(new Date(leave.endDate), 'MMM d, yyyy')}
                          </p>
                          <p className="text-xs text-slate-400">
                            Logged: {leave.submittedAt ? format(leave.submittedAt, 'yyyy-MM-dd HH:mm') : 'Draft'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          {leave.actingEmployeeNo ? (
                            <div className="space-y-1">
                               <p className="text-sm font-bold text-navy-900">{actInfo.name}</p>
                               <p className="text-xs text-slate-500 font-mono">ID: {actInfo.empNo}</p>
                               {actInfo.hasConflict && (
                                 <div className="flex items-center gap-1 text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded font-semibold border border-red-100 max-w-[180px]">
                                    <AlertTriangle size={10} className="text-red-500 flex-shrink-0" />
                                    <span className="truncate" title={actInfo.message}>{actInfo.message}</span>
                                 </div>
                               )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">None Assigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="space-y-1">
                            <StatusBadge status={leave.status} />
                            {leave.adminComment && (
                              <p className="text-xs text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100 max-w-[200px] italic">
                                "{leave.adminComment}"
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-xs text-slate-600 max-w-[240px] ml-auto truncate font-medium" title={leave.reason}>
                            {leave.reason}
                          </p>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                           <FolderMinus size={48} className="opacity-10 text-navy-900" />
                           <p className="font-bold text-sm">No leave history matches found.</p>
                           <p className="text-xs">Adjust your search criteria.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* -------------------- TAB: REPORTS (HOD, CEO & ADMIN) -------------------- */}
        {activeTab === 'reports' && (user.role === 'hod' || user.role === 'ceo' || user.role === 'admin') && (
          <div className="space-y-8 print:p-0">
             {/* Report Action Panels */}
             <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                   <h3 className="font-bold text-navy-900 font-serif italic text-lg">Report Configurations</h3>
                   <p className="text-xs text-slate-500 mt-1">Specify parameters to isolate departments, employee nodes, and timeframes.</p>
                </div>
                <div className="flex gap-3">
                   <button 
                     onClick={() => window.print()}
                     className="bg-slate-100 hover:bg-slate-200 text-navy-900 border border-slate-200 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 text-xs transition"
                   >
                     <Printer size={15} /> Print/PDF Report
                   </button>
                </div>
             </div>

             {/* Dynamic Multi-Section Filter Matrix */}
             <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                   <Filter size={16} className="text-amber-500" />
                   <h4 className="text-xs uppercase font-mono tracking-widest text-slate-400 font-bold">Query Parameters</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                   {/* Period filter */}
                   <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Timeframe Range</label>
                      <select 
                        value={reportPeriod} 
                        onChange={(e: any) => setReportPeriod(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-navy-900 focus:outline-none"
                      >
                        <option value="1m">1 Month (Past 30 Days)</option>
                        <option value="3m">3 Months (Past 90 Days)</option>
                        <option value="6m">6 Months (Past 180 Days)</option>
                        <option value="1y">1 Year (Past 365 Days)</option>
                        <option value="all">All-Time Institutional Data</option>
                      </select>
                   </div>

                   {/* Department filter */}
                   <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Department / Faculty</label>
                      <select 
                        value={reportDeptFilter} 
                        onChange={(e) => {
                          setReportDeptFilter(e.target.value);
                          setReportEmployeeFilter('All');
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-navy-900 focus:outline-none"
                      >
                        <option value="All">All Departments</option>
                        <option value="Academic">Academic</option>
                        <option value="Humanities">Humanities</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Medicine">Medicine</option>
                        <option value="Science">Science</option>
                      </select>
                   </div>

                   {/* Employee filter */}
                   <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Specific Academic Node</label>
                      <select 
                        value={reportEmployeeFilter} 
                        onChange={(e) => setReportEmployeeFilter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-navy-900 focus:outline-none"
                      >
                        <option value="All">All Department Employees</option>
                        {allUsers
                          .filter(u => reportDeptFilter === 'All' || u.department === reportDeptFilter)
                          .map(u => (
                             <option key={u.uid} value={u.uid}>
                               {u.name} ({u.employeeNo || 'No ID'})
                             </option>
                          ))
                        }
                      </select>
                   </div>

                   {/* Leave Type filter */}
                   <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Leave Sub-category</label>
                      <select 
                        value={reportTypeFilter} 
                        onChange={(e) => setReportTypeFilter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-navy-900 focus:outline-none"
                      >
                        <option value="All">All Leave Types</option>
                        <option value="Annual">Annual Leave</option>
                        <option value="Sick">Sick Leave</option>
                        <option value="Personal">Personal Leave</option>
                        <option value="Maternity/Paternity">Maternity/Paternity</option>
                        <option value="Study">Study Leave</option>
                      </select>
                   </div>
                </div>
             </div>

             {/* COMPUTE DERIVED LEAVE STATISTICS */}
             {(() => {
                const now = Date.now();
                const filteredListByPeriod = leaves.filter(l => {
                   // Timeframe check
                   if (reportPeriod !== 'all') {
                      const rangeDays = reportPeriod === '1m' ? 30 : reportPeriod === '3m' ? 90 : reportPeriod === '6m' ? 180 : 365;
                      const leaveTime = new Date(l.startDate).getTime();
                      const daysDiff = (now - leaveTime) / (1000 * 60 * 60 * 24);
                      // Include leaves around the current date window to handle mock entries flexibly
                      if (Math.abs(daysDiff) > rangeDays) return false;
                   }

                   // Department check
                   if (reportDeptFilter !== 'All' && l.department !== reportDeptFilter) return false;

                   // Employee check
                   if (reportEmployeeFilter !== 'All' && l.employeeId !== reportEmployeeFilter) return false;

                   // Type check
                   if (reportTypeFilter !== 'All' && l.type !== reportTypeFilter) return false;

                   return true;
                });

                // Derived analytics
                let approvedDays = 0;
                let pendingRequests = 0;
                let approvedRequests = 0;
                let rejectedRequests = 0;

                const leaveTypeCounts: Record<string, number> = {
                  Annual: 0,
                  Sick: 0,
                  Personal: 0,
                  'Maternity/Paternity': 0,
                  Study: 0
                };

                filteredListByPeriod.forEach(l => {
                   const duration = Math.ceil((new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                   if (l.status === 'Approved') {
                      approvedDays += duration;
                      approvedRequests++;
                   } else if (l.status === 'Pending') {
                      pendingRequests++;
                   } else if (l.status === 'Rejected') {
                      rejectedRequests++;
                   }
                   if (leaveTypeCounts[l.type] !== undefined) {
                      leaveTypeCounts[l.type]++;
                   }
                });

                const totalRequests = filteredListByPeriod.length;
                const approvalRate = totalRequests > 0 ? Math.round((approvedRequests / totalRequests) * 100) : 100;

                return (
                  <div className="space-y-8 animate-fade-in">
                     {/* Creative Dashboard KPIs */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-br from-navy-900 to-slate-900 text-white p-6 rounded-3xl relative overflow-hidden shadow-sm">
                           <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5">
                              <Calendar size={180} />
                           </div>
                           <p className="text-[10px] font-mono tracking-wider text-amber-400 font-bold uppercase">Total Approved Days</p>
                           <p className="text-4xl font-serif font-bold mt-2">{approvedDays}</p>
                           <p className="text-xs text-white/60 mt-2 font-medium">Approved calendar leave days</p>
                        </div>

                        <div className="bg-white border border-slate-200 p-6 rounded-3xl relative overflow-hidden shadow-sm">
                           <p className="text-[10px] font-mono tracking-wider text-slate-400 font-bold uppercase">Approval Rate</p>
                           <p className="text-4xl font-serif font-bold mt-2 text-navy-950">{approvalRate}%</p>
                           <div className="mt-2.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-emerald-500 h-full" style={{ width: `${approvalRate}%` }} />
                           </div>
                           <p className="text-xs text-slate-500 mt-2 font-medium">{approvedRequests} of {totalRequests} applications</p>
                        </div>

                        <div className="bg-white border border-slate-200 p-6 rounded-3xl relative overflow-hidden shadow-sm">
                           <p className="text-[10px] font-mono tracking-wider text-slate-400 font-bold uppercase">In Evaluation Pipeline</p>
                           <p className="text-4xl font-serif font-bold mt-2 text-amber-500">{pendingRequests}</p>
                           <p className="text-xs text-slate-500 mt-2 font-medium">Pending approvals</p>
                        </div>

                        <div className="bg-white border border-slate-200 p-6 rounded-3xl relative overflow-hidden shadow-sm">
                           <p className="text-[10px] font-mono tracking-wider text-slate-400 font-bold uppercase">Total Transactions</p>
                           <p className="text-4xl font-serif font-bold mt-2 text-navy-950">{totalRequests}</p>
                           <p className="text-xs text-slate-500 mt-2 font-medium">Requests in selected timeframe</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Creative Leave Distribution Bar Chart */}
                        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm lg:col-span-5">
                           <h4 className="font-serif italic font-bold text-navy-900 mb-6 text-base">Distribution by Leave Category</h4>
                           <div className="space-y-4">
                              {Object.entries(leaveTypeCounts).map(([type, val]) => {
                                 const pct = totalRequests > 0 ? Math.round((val / totalRequests) * 100) : 0;
                                 const barColor = {
                                    Annual: 'bg-emerald-500',
                                    Sick: 'bg-rose-500',
                                    Personal: 'bg-indigo-500',
                                    'Maternity/Paternity': 'bg-purple-500',
                                    Study: 'bg-amber-500'
                                 }[type] || 'bg-slate-400';
                                 
                                 return (
                                    <div key={type} className="space-y-1">
                                       <div className="flex justify-between text-xs text-slate-600 font-bold">
                                          <span>{type} Leave</span>
                                          <span>{val} ({pct}%)</span>
                                       </div>
                                       <div className="w-full bg-slate-50 rounded-full h-3 border border-slate-100 overflow-hidden">
                                          <motion.div 
                                             className={`h-full ${barColor}`} 
                                             initial={{ width: 0 }}
                                             animate={{ width: `${pct}%` }}
                                             transition={{ duration: 0.6, ease: 'easeOut' }}
                                          />
                                       </div>
                                    </div>
                                 );
                              })}
                           </div>
                        </div>

                        {/* Leave Trend & Summary Insights */}
                        <div className="bg-navy-950 text-white/90 p-6 rounded-3xl shadow-sm lg:col-span-7 flex flex-col justify-between">
                           <div>
                              <h4 className="font-serif italic font-bold text-amber-400 mb-4 text-base">Institutional Insights Summary</h4>
                              <div className="space-y-4 text-xs font-sans">
                                 <p className="leading-relaxed">
                                    This visual report consolidates active leave datasets within your faculty department. Academic personnel resource availability is tracked dynamically against ongoing academic and administrative schedules.
                                 </p>
                                 <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="bg-white/10 p-3 rounded-2xl border border-white/5">
                                       <p className="text-white/40 text-[10px] uppercase font-mono font-bold tracking-wider">Department Strain</p>
                                       <p className="text-sm font-bold text-white mt-1">
                                          {pendingRequests > 0 ? 'Evaluating Demands' : 'Optimal Capacity'}
                                       </p>
                                    </div>
                                    <div className="bg-white/10 p-3 rounded-2xl border border-white/5">
                                       <p className="text-white/40 text-[10px] uppercase font-mono font-bold tracking-wider">Health/Sick Ratio</p>
                                       <p className="text-sm font-bold text-white mt-1">
                                          {totalRequests > 0 ? `${Math.round((leaveTypeCounts['Sick'] / totalRequests) * 100)}% of Leaves` : '0%'}
                                       </p>
                                    </div>
                                 </div>
                              </div>
                           </div>
                           <div className="pt-6 border-t border-white/5 mt-6 text-[10px] text-white/40 flex justify-between">
                              <span>Department Filter Context: {reportDeptFilter}</span>
                              <span>Timestamp: {format(new Date(), 'yyyy-MM-dd HH:mm')}</span>
                           </div>
                        </div>
                     </div>

                     {/* Main Report Table */}
                     <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                           <h4 className="font-serif italic font-bold text-navy-900 text-base">Leave Records Table Ledger</h4>
                           <span className="text-[10px] font-mono bg-navy-900/5 text-navy-950 font-bold px-3 py-1 rounded-full">{filteredListByPeriod.length} Records</span>
                        </div>
                        <div className="overflow-x-auto">
                           <table className="w-full text-left border-collapse font-sans">
                              <thead>
                                 <tr className="bg-slate-50 text-[10px] font-mono tracking-wider text-slate-400 uppercase border-b border-slate-100">
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4">Department</th>
                                    <th className="px-6 py-4">Leave Range (Days)</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Acting Staff</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Reason</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-xs">
                                 {filteredListByPeriod.length > 0 ? (
                                    filteredListByPeriod.map((l) => {
                                       const actInfo = checkActingPersonConflict(l);
                                       const days = Math.ceil((new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                                       return (
                                          <tr key={l.id} className="hover:bg-slate-50/30 transition-colors">
                                             <td className="px-6 py-4 font-bold text-navy-950">
                                                <div>
                                                   <p>{l.employeeName}</p>
                                                   <p className="text-[10px] text-slate-400 font-mono font-medium">#{l.employeeNo}</p>
                                                </div>
                                             </td>
                                             <td className="px-6 py-4 text-slate-600">{l.department}</td>
                                             <td className="px-6 py-4 font-medium text-slate-700">
                                                <div>
                                                   <p>{format(new Date(l.startDate), 'MMM d')} - {format(new Date(l.endDate), 'MMM d, yyyy')}</p>
                                                   <p className="text-[10px] text-amber-600 font-bold mt-0.5">{days} {days === 1 ? 'day' : 'days'}</p>
                                                </div>
                                             </td>
                                             <td className="px-6 py-4 font-semibold text-slate-600">{l.type}</td>
                                              <td className="px-6 py-4">
                                                 {l.actingEmployeeNo ? (
                                                    <div className="space-y-1">
                                                       <p className="text-[11px] font-bold text-navy-900">{actInfo.name}</p>
                                                       <p className="text-[10px] text-slate-500 font-mono">ID: {actInfo.empNo}</p>
                                                       {actInfo.hasConflict && (
                                                         <div className="flex items-center gap-1 text-[9px] text-red-600 bg-red-50 px-1.5 py-0.5 border border-red-150 rounded font-semibold max-w-[150px]">
                                                            <AlertTriangle size={8} className="text-red-500 flex-shrink-0" />
                                                            <span className="truncate" title={actInfo.message}>{actInfo.message}</span>
                                                         </div>
                                                       )}
                                                    </div>
                                                 ) : (
                                                    <span className="text-xs text-slate-400 italic font-medium">None</span>
                                                 )}
                                              </td>
                                             <td className="px-6 py-4">
                                                <StatusBadge status={l.status} />
                                             </td>
                                             <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate" title={l.reason}>
                                                {l.reason}
                                             </td>
                                          </tr>
                                       );
                                    })
                                 ) : (
                                    <tr>
                                       <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                                          <div className="flex flex-col items-center gap-2">
                                             <FolderMinus size={48} className="opacity-10 text-navy-900" />
                                             <p className="font-bold text-sm">No transaction records in this interval.</p>
                                             <p className="text-xs">Loosen filters to load historical data logs.</p>
                                          </div>
                                       </td>
                                    </tr>
                                 )}
                              </tbody>
                           </table>
                        </div>
                     </div>
                  </div>
                );
             })()}
          </div>
        )}

        {/* -------------------- TAB: APPROVALS (HOD & CEO) -------------------- */}
        {activeTab === 'approvals' && (user.role === 'hod' || user.role === 'ceo') && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div>
                 <h3 className="font-bold text-navy-900 font-serif italic text-lg">Leave Requests Awaiting Your Evaluation</h3>
                 <p className="text-xs text-slate-500 mt-1">
                   {user.role === 'hod' ? 'Standard Employees requests. Showing acting-person real-time calendars.' : 'HOD requests. Executive final review.'}
                 </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Leave Type</th>
                    <th className="px-6 py-4">Duration Range</th>
                    <th className="px-6 py-4">Acting Staff Calendar Info</th>
                    <th className="px-6 py-4">Reason Statement</th>
                    <th className="px-6 py-4 text-right">Appreciation Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeaves.filter(l => l.status === 'Pending').length > 0 ? (
                    filteredLeaves.filter(l => l.status === 'Pending').map((leave) => {
                      const actCheck = checkActingPersonConflict(leave);
                      return (
                        <tr key={leave.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-950 flex items-center justify-center font-bold text-sm">
                                {leave.employeeName?.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-navy-900">{leave.employeeName}</p>
                                <p className="text-[10px] font-mono font-bold text-slate-400">{leave.employeeNo}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-navy-900 bg-slate-100 px-3 py-1.5 rounded-lg">{leave.type}</span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-slate-700">
                              {format(new Date(leave.startDate), 'MMM d')} - {format(new Date(leave.endDate), 'MMM d')}
                            </p>
                            <p className="text-xs text-slate-400">
                              {leave.submittedAt ? `Submitted ${format(leave.submittedAt, 'yyyy-MM-dd HH:mm')}` : ''}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            {leave.actingEmployeeNo ? (
                              <div className="space-y-1">
                                <p className="text-sm font-bold text-navy-950">{actCheck.name}</p>
                                <p className="text-xs font-mono text-slate-400 font-bold">{actCheck.empNo}</p>
                                {actCheck.hasConflict ? (
                                  <div className="flex flex-col gap-1 text-xs text-red-600 bg-red-50 border border-red-150 p-2 rounded-xl font-bold animate-pulse">
                                     <div className="flex items-center gap-1 text-red-700">
                                        <AlertTriangle size={14} className="text-red-600 flex-shrink-0" />
                                        <span>Conflict Clashing!</span>
                                     </div>
                                     <span className="text-[10px] text-red-500 font-medium font-sans leading-relaxed">{actCheck.message}</span>
                                  </div>
                                ) : (
                                  <span className="inline-block text-[10px] text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-md font-bold">
                                    No Conflict (Available)
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">None</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                            <p className="max-w-[200px] leading-relaxed break-words">"{leave.reason}"</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <button 
                                onClick={() => setShowCommentModal({ id: leave.id, status: 'Approved' })}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xs shadow-sm transition-all"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => setShowCommentModal({ id: leave.id, status: 'Rejected' })}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs shadow-sm transition-all"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                           <CheckCircle2 size={48} className="text-green-500 opacity-60" />
                           <p className="text-sm font-bold text-navy-900">Queue Cleared!</p>
                           <p className="text-xs">No pending requests require your attention.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* -------------------- TAB: ADMIN (STAFF DIRECTORY) -------------------- */}
        {activeTab === 'admin' && user.role === 'admin' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div>
                <h3 className="font-bold text-navy-900 font-serif italic text-lg">University Staff Directory Directory</h3>
                <p className="text-xs text-slate-500">Edit access tiers, department faculty, or delete profiles from the central directory database.</p>
              </div>
              <div className="w-full md:w-64 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search staff members..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Staff Name & Email</th>
                    <th className="px-6 py-4">Employee Number</th>
                    <th className="px-6 py-4">Department / Faculty</th>
                    <th className="px-6 py-4">Security Level</th>
                    <th className="px-6 py-4">Holiday Allowance</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {allUsers.filter(u => (u.name || '').toLowerCase().includes(filter.toLowerCase()) || (u.employeeNo || '').toLowerCase().includes(filter.toLowerCase())).length > 0 ? (
                    allUsers.filter(u => (u.name || '').toLowerCase().includes(filter.toLowerCase()) || (u.employeeNo || '').toLowerCase().includes(filter.toLowerCase())).map((usr) => (
                      <tr key={usr.uid} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-navy-900 text-amber-400 flex items-center justify-center font-bold text-xs uppercase">
                              {usr.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-navy-900">{usr.name}</p>
                              <p className="text-xs text-slate-500">{usr.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">
                          {usr.employeeNo || "Not Assigned"}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-semibold">
                          {usr.department}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getRoleBadgeColor(usr.role)}`}>
                            {usr.role === 'employee' ? 'Staff' : usr.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-navy-900">
                          {usr.totalLeaveDays} Days Limit
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button 
                              onClick={() => {
                                setEditingUser(usr);
                              }}
                              className="p-2 border border-slate-200 text-navy-900 hover:bg-slate-50 rounded-xl transition-all"
                              title="Edit Staff Member"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => {
                                setUserToDelete(usr);
                              }}
                              className="p-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                              title="Delete Profile"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                        No staff matching your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ----------------- MODAL: LEAVE REQUEST ----------------- */}
      <AnimatePresence>
        {isApplyModalOpen && (
          <LeaveRequestModal 
            user={user} 
            onClose={() => setIsApplyModalOpen(false)} 
            allUsers={allUsers}
            leaves={leaves}
          />
        )}
      </AnimatePresence>

      {/* ----------------- MODAL: ADMIN EDIT ----------------- */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setEditingUser(null)} 
              className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-serif font-bold text-navy-900">Modify Faculty Profile</h3>
                <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-navy-900">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Employee Number - Locked & Read Only */}
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Employee Number (Immutable ID)</label>
                   <div className="relative">
                     <input 
                       type="text" 
                       disabled 
                       className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-500 focus:outline-none" 
                       value={editingUser.employeeNo || "Not assigned"} 
                     />
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                       <Lock size={16} />
                     </div>
                   </div>
                   <p className="text-[10px] text-amber-600 mt-1">Employee numbers are permanent and cannot be modified.</p>
                </div>

                {/* Name */}
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Legal Name</label>
                   <input 
                     type="text" 
                     className="input-field" 
                     value={editingUser.name}
                     onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                   />
                </div>

                {/* Email (Read Only too block accidental changes) */}
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Official email</label>
                   <input 
                     type="text" 
                     disabled
                     className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500" 
                     value={editingUser.email}
                   />
                </div>

                {/* Access Level */}
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Security Level</label>
                   <select 
                     className="input-field bg-white"
                     value={editingUser.role}
                     onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                   >
                     <option value="employee">Staff Member</option>
                     <option value="hod">HOD (Head of Department)</option>
                     <option value="ceo">CEO</option>
                     <option value="admin">Administrator</option>
                   </select>
                </div>

                {/* Department Faculty */}
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Faculty / Department</label>
                   <select 
                     className="input-field bg-white"
                     value={editingUser.department}
                     onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                   >
                      <option>Academic</option>
                      <option>Humanities</option>
                      <option>Engineering</option>
                      <option>Medicine</option>
                      <option>Administration</option>
                   </select>
                </div>

                {/* Total holidays limit */}
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Allocated Leave Days</label>
                   <input 
                     type="number" 
                     className="input-field" 
                     value={editingUser.totalLeaveDays}
                     onChange={(e) => setEditingUser({ ...editingUser, totalLeaveDays: Number(e.target.value) })}
                   />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-slate-100 font-bold hover:bg-slate-200 py-3 rounded-2xl text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setUserToConfirmEdit({
                      id: editingUser.uid,
                      data: {
                        name: editingUser.name,
                        role: editingUser.role,
                        department: editingUser.department,
                        totalLeaveDays: editingUser.totalLeaveDays
                      }
                    });
                  }}
                  className="flex-1 bg-navy-900 text-white font-bold hover:bg-navy-800 py-3 rounded-2xl text-sm"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------------- CONFIRMATION: EDIT PROFILE ---------------- */}
      <AnimatePresence>
        {userToConfirmEdit && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50" />
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white p-6 rounded-3xl max-w-sm w-full relative z-10 text-center"
            >
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} />
              </div>
              <h4 className="text-lg font-bold text-navy-900 mb-2">Confirm Edit Action</h4>
              <p className="text-sm text-slate-500 mb-6">Are you sure you want to save these profile changes? The staff's departmental parameters will be saved.</p>
              <div className="flex gap-2">
                <button onClick={() => setUserToConfirmEdit(null)} className="flex-1 py-2.5 bg-slate-100 font-bold rounded-xl text-sm">Dismiss</button>
                <button onClick={handleEditConfirm} className="flex-1 py-2.5 bg-navy-900 text-white font-semibold rounded-xl text-sm">Save Profiles</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------------- CONFIRMATION: DELETE PROFILE ---------------- */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setUserToDelete(null)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white p-6 rounded-3xl max-w-sm w-full relative z-10 text-center"
            >
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h4 className="text-lg font-bold text-navy-900 mb-2">Confirm Deletion</h4>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to permanently delete <strong>{userToDelete.name}</strong> ({userToDelete.employeeNo}) from the university staff directory? This action is irreversible.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setUserToDelete(null)} className="flex-1 py-2.5 bg-slate-100 font-bold rounded-xl text-sm">Dismiss</button>
                <button onClick={handleDeleteConfirm} className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl text-sm">Permanently Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------------- MODAL: EVALUATION COMMENT (APPROVE/REJECT) ---------------- */}
      <AnimatePresence>
        {showCommentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCommentModal(null)} className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white p-8 rounded-3xl max-w-md w-full relative z-10"
            >
              <h4 className="text-lg font-serif font-bold text-navy-900 mb-2 italic">
                Comment on Leave {showCommentModal.status}
              </h4>
              <p className="text-xs text-slate-500 mb-4">You can optionally state a comment or administrative note for this decision record.</p>
              
              <textarea 
                rows={3}
                className="input-field resize-none py-2 text-sm p-4"
                placeholder="E.g. Department capacity is sufficient/Academic rescheduling resolved..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowCommentModal(null)} className="flex-1 py-2.5 bg-slate-100 font-bold rounded-xl text-sm">Cancel</button>
                <button 
                  onClick={handleUpdateStatusConfirm} 
                  className={`flex-1 py-2.5 text-white font-bold rounded-xl text-sm ${showCommentModal.status === 'Approved' ? 'bg-green-600' : 'bg-red-600'}`}
                >
                  Confirm {showCommentModal.status}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const SidebarLink = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-bold ${
      active ? 'bg-amber-500 text-navy-900 shadow-md scale-[1.02]' : 'text-white/60 hover:bg-white/5 hover:text-white'
    }`}
  >
    <Icon size={18} />
    <span className="text-sm">{label}</span>
  </button>
);

const StatCard = ({ label, value, icon: Icon, color, suffix }: { label: string, value: number, icon: any, color: 'blue' | 'amber' | 'green' | 'slate', suffix: string }) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    green: 'text-green-600 bg-green-50 border-green-100',
    slate: 'text-slate-600 bg-slate-50 border-slate-100',
  };
  return (
    <div className={`p-6 rounded-[2rem] border bg-white shadow-sm flex flex-col justify-between h-32`}>
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon size={16} />
        </div>
      </div>
      <div>
         <span className="text-2xl font-serif font-bold text-navy-900">{value}</span>
         <span className="text-xs text-slate-400 ml-1 font-semibold">{suffix}</span>
      </div>
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
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border inline-block ${styles}`}>
      {status}
    </span>
  );
};

const ProfileDisplayField = ({ label, value, highlight, badge }: { label: string, value: string | number, highlight?: boolean, badge?: UserRole }) => {
  const getBadgeStyle = (b: UserRole) => {
    return {
      admin: 'bg-amber-100 text-amber-800 border-amber-200',
      hod: 'bg-purple-100 text-purple-800 border-purple-200',
      ceo: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      employee: 'bg-blue-100 text-blue-800 border-blue-200'
    }[b];
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
       <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</span>
       {badge ? (
         <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${getBadgeStyle(badge)}`}>
           {value}
         </span>
       ) : (
         <span className={`text-sm font-bold block ${highlight ? 'font-mono text-amber-600 tracking-wider text-base' : 'text-navy-950'}`}>
           {value}
         </span>
       )}
    </div>
  );
};

// Leave request Form Modal (including Acting Person verification errorDialog and checker)
const LeaveRequestModal = ({ user, onClose, allUsers, leaves }: { user: UserProfile, onClose: () => void, allUsers: UserProfile[], leaves: LeaveRequest[] }) => {
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    type: 'Annual' as LeaveType,
    actingEmployeeNo: '',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  // Custom Error Dialog for non-existent Acting employee No
  const [errorDialogMsg, setErrorDialogMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validation checks
    if (!formData.reason.trim()) {
      setError('Please state the reason for your leave request.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.actingEmployeeNo.trim()) {
      setError('Please specify an Acting Employee Number.');
      setIsSubmitting(false);
      return;
    }

    // ACTING STAFF CHECK: acting person should already be in data base
    const matchedProfile = await userService.verifyEmployeeNoExists(formData.actingEmployeeNo);
    if (!matchedProfile) {
      setErrorDialogMsg(`Invalid Employee Number "${formData.actingEmployeeNo}". The acting person must already exist in the user database. Please verify and input a valid staff member's Employee No.`);
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

    const s1 = start.getTime();
    const e1 = end.getTime();

    // Check 1: Does the acting person themself have approved leave in overlapping dates?
    const overlappingOwnLeave = leaves.find(l => {
      if (l.employeeId !== matchedProfile.uid || l.status !== 'Approved') return false;
      const s2 = new Date(l.startDate).getTime();
      const e2 = new Date(l.endDate).getTime();
      return s1 <= e2 && s2 <= e1;
    });

    if (overlappingOwnLeave) {
      setErrorDialogMsg(`Conflict Alert! The nominated acting person "${matchedProfile.name}" is already scheduled on approved leave during this period (${format(new Date(overlappingOwnLeave.startDate), 'MMM d')} - ${format(new Date(overlappingOwnLeave.endDate), 'MMM d')}). Please designate another eligible colleague.`);
      setIsSubmitting(false);
      return;
    }

    // Check 2: Is the nominated colleague already assigned as acting staff in another overlapping leave?
    const overlappingActingAssign = leaves.find(l => {
      if (l.status === 'Rejected') return false;
      if (!l.actingEmployeeNo) return false;
      if (l.actingEmployeeNo.trim().toLowerCase() !== formData.actingEmployeeNo.trim().toLowerCase()) return false;
      const s2 = new Date(l.startDate).getTime();
      const e2 = new Date(l.endDate).getTime();
      return s1 <= e2 && s2 <= e1;
    });

    if (overlappingActingAssign) {
      setErrorDialogMsg(`Double-Booking Conflict! The nominated acting person "${matchedProfile.name}" is already assigned/nominated as the acting representative for "${overlappingActingAssign.employeeName}" during this overlapping period (${format(new Date(overlappingActingAssign.startDate), 'MMM d')} - ${format(new Date(overlappingActingAssign.endDate), 'MMM d')}). Please select another eligible colleague.`);
      setIsSubmitting(false);
      return;
    }

    try {
      await leaveService.submitRequest({
        employeeId: user.uid,
        employeeName: user.name,
        employeeNo: user.employeeNo || 'emp00000',
        department: user.department,
        startDate: formData.startDate,
        endDate: formData.endDate,
        type: formData.type,
        reason: formData.reason,
        actingEmployeeNo: formData.actingEmployeeNo.trim()
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: any) {
      console.error('Submission failed:', err);
      setError('Failed to submit request. Please try again.');
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
          <p className="text-white/50 text-sm">Fill in dates and designate acting personnel on campus.</p>
        </div>

        {submitted ? (
          <div className="p-16 text-center">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-200"
            >
              <Check size={40} strokeWidth={3} />
            </motion.div>
            <h3 className="text-2xl font-serif font-bold text-navy-900 mb-3 italic">Request Logged</h3>
            <p className="text-slate-500 max-w-xs mx-auto text-sm leading-relaxed mb-6">
              Your leave request has been submitted to authorized leaders for calendar checks.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl flex items-center gap-2 font-bold">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Start Date</label>
                <input 
                  type="date" 
                  required
                  min={today}
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
                  min={formData.startDate || today}
                  className="input-field"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Leave Type</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {['Annual', 'Sick', 'Personal', 'Maternity/Paternity', 'Study'].map((type) => (
                  <button 
                    key={type}
                    type="button"
                    onClick={() => setFormData({...formData, type: type as LeaveType})}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                      formData.type === type ? 'bg-navy-900 text-white border-navy-900' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-navy-900'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* ACTING PERSON - Employee No Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Acting Person Designation</label>
                <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Required Field</span>
              </div>
              <input 
                type="text" 
                required
                className="input-field font-mono uppercase" 
                placeholder="E.g. emp00001 (Must exist)"
                value={formData.actingEmployeeNo}
                onChange={(e) => setFormData({...formData, actingEmployeeNo: e.target.value})}
              />
              <p className="text-[10px] text-slate-400 mt-1">Specify their verified Employee Identification number.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Reason for Leave</label>
              <textarea 
                rows={2}
                required
                placeholder="Enter details of your leave request..."
                className="input-field resize-none py-3"
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full primary-button py-3.5 flex items-center justify-center gap-2 font-bold"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                'Submit Holiday Application'
              )}
            </button>
          </form>
        )}
      </motion.div>

      {/* ERROR DIALOG OVERLAY: Generating popup on unmatched employee No */}
      <AnimatePresence>
        {errorDialogMsg && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60" />
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white p-8 rounded-[2rem] max-w-sm w-full relative z-10 text-center shadow-2xl border border-red-100"
            >
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
                <XCircle size={28} />
              </div>
              <h4 className="text-xl font-serif font-bold text-navy-900 mb-2 italic">Invalid Staff Assignment!</h4>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                {errorDialogMsg}
              </p>
              <button 
                onClick={() => setErrorDialogMsg(null)}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95"
              >
                Acknowledge and Revise
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useState, useEffect, useContext } from 'react';
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
  Printer,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { leaveService, userService, systemService } from '../services/db';
import { LeaveRequest, UserProfile, LeaveType, UserRole, LeaveStatus } from '../types';
import { format } from 'date-fns';
import { LanguageContext } from '../App';
import EnrollModal from './EnrollModal';
import { jsPDF } from 'jspdf';

interface PortalProps {
  user: UserProfile;
}

export default function Portal({ user }: PortalProps) {
  const { lang, t } = useContext(LanguageContext);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'approvals' | 'history' | 'admin' | 'reports'>('dashboard');
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  
  // Filters
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Report Filter States
  const [reportPeriod, setReportPeriod] = useState<'1m' | '3m' | '6m' | '1y' | 'all'>('3m');
  const [reportTypeFilter, setReportTypeFilter] = useState<string>('All');
  const [reportDeptFilter, setReportDeptFilter] = useState<string>(user?.department || 'All');
  const [reportEmployeeFilter, setReportEmployeeFilter] = useState<string>('All');
  const [ceoPdfFilter, setCeoPdfFilter] = useState<'1m' | '3m' | '6m' | '1y'>('3m');
  const [hodPdfFilter, setHodPdfFilter] = useState<'1m' | '3m' | '6m' | '1y'>('3m');
  const [staffPdfFilter, setStaffPdfFilter] = useState<'1m' | '3m' | '6m' | '1y'>('3m');

  // Admin Profile Management States
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userToConfirmEdit, setUserToConfirmEdit] = useState<{ id: string, data: Partial<UserProfile> } | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  // Leave approval comment input
  const [showCommentModal, setShowCommentModal] = useState<{ id: string, status: 'Approved' | 'Rejected' } | null>(null);
  const [commentText, setCommentText] = useState('');

  // Slider image state
  const [sliderImageUrl, setSliderImageUrl] = useState('');
  const [sliderImageInput, setSliderImageInput] = useState('');
  const [savingSliderImage, setSavingSliderImage] = useState(false);
  const [saveSliderSuccess, setSaveSliderSuccess] = useState(false);

  // My WhatsApp phone state
  const [myPhoneInput, setMyPhoneInput] = useState(user.phone || '');
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [savePhoneSuccess, setSavePhoneSuccess] = useState(false);

  // WhatsApp verification states
  const [verificationOtp, setVerificationOtp] = useState<{ phone: string; code: string } | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [verificationError, setVerificationError] = useState('');

  // WhatsApp post-approval modal state
  const [whatsappModalData, setWhatsappModalData] = useState<{
    employeeName: string;
    phone: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (user && user.phone) {
      setMyPhoneInput(user.phone);
    }
  }, [user]);

  const handleSaveMyPhone = () => {
    const cleanPhone = myPhoneInput.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 9) {
      alert("Please enter a valid WhatsApp number with country code (minimum 9 digits, e.g. 94771234567).");
      return;
    }
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationOtp({
      phone: cleanPhone,
      code: generatedCode
    });
    setOtpInput('');
    setVerificationError('');
  };

  const handleVerifyCode = async () => {
    if (!verificationOtp) return;
    if (otpInput !== verificationOtp.code) {
      setVerificationError("Verification code mismatch. Please enter the correct code shown in the simulated gateway.");
      return;
    }
    
    setIsSavingPhone(true);
    try {
      const nowString = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
      await userService.updateProfile(user.uid, { 
        phone: verificationOtp.phone,
        phoneVerified: true,
        phoneVerifiedAt: nowString
      });
      setVerificationOtp(null);
      setSavePhoneSuccess(true);
      setTimeout(() => setSavePhoneSuccess(false), 3000);
    } catch (e) {
      console.error('Error saving phone:', e);
      setVerificationError("Database error. Please try again.");
    } finally {
      setIsSavingPhone(false);
    }
  };

  useEffect(() => {
    if (user.role === 'admin') {
      const unsubscribe = systemService.listenSliderImage((url) => {
        setSliderImageUrl(url);
        setSliderImageInput(url);
      });
      return () => unsubscribe();
    }
  }, [user.role]);

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
    if (user.role === 'employee' || user.role === 'staff') {
      // Employees only view their own leave requests
      return l.employeeId === user.uid && matchesSearch && matchesStatus;
    } else if (user.role === 'hod') {
      // HOD can see leaves in their own department (either stored on the leave request or from the creator's current profile department)
      const leaveCreator = allUsers.find(u => u.uid === l.employeeId);
      const leaveCreatorDept = leaveCreator?.department;
      const isSameDept = 
        (l.department?.trim().toLowerCase() === user.department?.trim().toLowerCase()) ||
        (leaveCreatorDept && leaveCreatorDept.trim().toLowerCase() === user.department?.trim().toLowerCase());

      if (activeTab === 'approvals') {
        // HOD approves 'employee' or 'staff' role leaves only in their department.
        // Fallback to true if allUsers list hasn't loaded the user profile yet to prevent empty lists during sync.
        const isEmployeeOrLoading = !leaveCreator || leaveCreator.role === 'employee' || leaveCreator.role === 'staff';
        return l.employeeId !== user.uid && isEmployeeOrLoading && isSameDept && matchesSearch && matchesStatus;
      }
      return isSameDept && matchesSearch && matchesStatus;
    } else if (user.role === 'ceo') {
      // CEO approves HOD leaves across any department
      if (activeTab === 'approvals') {
        const leaveCreator = allUsers.find(u => u.uid === l.employeeId);
        // CEO approves 'hod' role leaves only.
        // Fallback to true if allUsers list hasn't loaded the user profile yet to prevent empty lists during sync.
        const isHodOrLoading = !leaveCreator || leaveCreator.role === 'hod';
        return l.employeeId !== user.uid && isHodOrLoading && matchesSearch && matchesStatus;
      }
      return matchesSearch && matchesStatus;
    } else if (user.role === 'admin') {
      // Admins see leaves of their own department
      const isSameDept = l.department?.trim().toLowerCase() === user.department?.trim().toLowerCase();
      return isSameDept && matchesSearch && matchesStatus;
    }
    
    // Fallback
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: user.totalLeaveDays,
    used: leaves.filter(l => l.employeeId === user.uid && l.status === 'Approved').length,
    pending: leaves.filter(l => l.employeeId === user.uid && l.status === 'Pending').length,
    remaining: user.totalLeaveDays - leaves.filter(l => l.employeeId === user.uid && l.status === 'Approved').length,
  };

  const handleDownloadHODReport = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const now = Date.now();
    const rangeDays = hodPdfFilter === '1m' ? 30 : hodPdfFilter === '3m' ? 90 : hodPdfFilter === '6m' ? 180 : 365;
    
    // HOD only reports on leaves in their department (checks leave request department or user's current department)
    const reportLeaves = leaves.filter(l => {
      const leaveCreator = allUsers.find(u => u.uid === l.employeeId);
      const leaveCreatorDept = leaveCreator?.department;
      const isSameDept = 
        (l.department?.trim().toLowerCase() === user.department?.trim().toLowerCase()) ||
        (leaveCreatorDept && leaveCreatorDept.trim().toLowerCase() === user.department?.trim().toLowerCase());
      if (!isSameDept) return false;
      
      const leaveTime = new Date(l.startDate).getTime();
      const daysDiff = (now - leaveTime) / (1000 * 60 * 60 * 24);
      return Math.abs(daysDiff) <= rangeDays;
    });

    // Sort leaves by start date descending
    reportLeaves.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    let approvedDays = 0;
    let approvedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;
    const typeCounts: Record<string, number> = {
      Annual: 0,
      Sick: 0,
      Personal: 0,
      'Maternity/Paternity': 0,
      Study: 0
    };

    reportLeaves.forEach(l => {
      const duration = Math.ceil((new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (l.status === 'Approved') {
        approvedDays += duration;
        approvedCount++;
      } else if (l.status === 'Pending') {
        pendingCount++;
      } else if (l.status === 'Rejected') {
        rejectedCount++;
      }
      if (typeCounts[l.type] !== undefined) {
        typeCounts[l.type]++;
      }
    });

    const totalRequests = reportLeaves.length;
    const approvalRate = totalRequests > 0 ? Math.round((approvedCount / totalRequests) * 100) : 100;

    // Draw PDF content
    doc.setFillColor(249, 115, 22); // Orange
    doc.rect(14, 15, 182, 1.5, 'F');

    // Title Block
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text('JAFFNA UNIVERSITY', 14, 25);
    
    doc.setFontSize(13);
    doc.setTextColor(71, 85, 105);
    doc.text(`HOD - ${user.department?.toUpperCase() || 'DEPARTMENT'} LEAVE SUMMARY REPORT`, 14, 31);

    // Meta Info
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    const periodLabel = {
      '1m': '1 Month (Past 30 Days)',
      '3m': '3 Months (Past 90 Days)',
      '6m': '6 Months (Past 180 Days)',
      '1y': '1 Year (Past 365 Days)'
    }[hodPdfFilter];
    doc.text(`Report Timeframe: ${periodLabel}`, 14, 37);
    doc.text(`Generated On: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')} (UTC)`, 14, 41);

    // Right-aligned header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(249, 115, 22);
    doc.text('DEPARTMENTAL LEAVE AUDIT', 196 - doc.getTextWidth('DEPARTMENTAL LEAVE AUDIT'), 25);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const viewerText = `Department HOD: ${user.name}`;
    doc.text(viewerText, 196 - doc.getTextWidth(viewerText), 31);

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(14, 45, 196, 45);

    // KPI Blocks
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 49, 42, 22, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, 49, 42, 22, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('APPROVED DAYS', 18, 55);
    doc.setFontSize(16);
    doc.setTextColor(249, 115, 22);
    doc.text(`${approvedDays} Days`, 18, 64);

    doc.setFillColor(248, 250, 252);
    doc.rect(60, 49, 42, 22, 'F');
    doc.rect(60, 49, 42, 22, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('APPROVAL RATE', 64, 55);
    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129);
    doc.text(`${approvalRate}%`, 64, 64);

    doc.setFillColor(248, 250, 252);
    doc.rect(106, 49, 42, 22, 'F');
    doc.rect(106, 49, 42, 22, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('PENDING PIPELINE', 110, 55);
    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246);
    doc.text(`${pendingCount} Apps`, 110, 64);

    doc.setFillColor(248, 250, 252);
    doc.rect(152, 49, 44, 22, 'F');
    doc.rect(152, 49, 44, 22, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('TOTAL APPLICATIONS', 156, 55);
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text(`${totalRequests} Records`, 156, 64);

    // Distribution
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('LEAVE CATEGORY DISTRIBUTION', 14, 79);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Distribution and counts of department requested leave profiles within this selected period.', 14, 83);

    let chartY = 88;
    Object.entries(typeCounts).forEach(([type, count]) => {
      const percentage = totalRequests > 0 ? count / totalRequests : 0;
      const barMaxWidth = 100;
      const barWidth = percentage * barMaxWidth;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(`${type} Leave`, 14, chartY + 4);

      // Bar BG
      doc.setFillColor(241, 245, 249);
      doc.rect(55, chartY + 1, barMaxWidth, 4, 'F');

      if (barWidth > 0) {
        doc.setFillColor(249, 115, 22);
        doc.rect(55, chartY + 1, barWidth, 4, 'F');
      }

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(`${count} (${Math.round(percentage * 100)}%)`, 160, chartY + 4);

      chartY += 7;
    });

    let tableY = chartY + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('DETAILED DEPARTMENTAL LEAVE LEDGER', 14, tableY);

    tableY += 5;
    doc.setFillColor(15, 23, 42);
    doc.rect(14, tableY, 182, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('Employee', 16, tableY + 5.5);
    doc.text('Department', 55, tableY + 5.5);
    doc.text('Dates & Total Days', 85, tableY + 5.5);
    doc.text('Type', 130, tableY + 5.5);
    doc.text('Status', 152, tableY + 5.5);
    doc.text('Reason', 170, tableY + 5.5);

    let rowY = tableY + 8;
    let pageNum = 1;

    if (reportLeaves.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('No transaction records logged in this timeframe.', 14, rowY + 8);
    } else {
      reportLeaves.forEach((l) => {
        if (rowY > 265) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(148, 163, 184);
          doc.text(`Jaffna University Staff Leave Ledger • HOD Departmental Report • Page ${pageNum}`, 14, 287);
          doc.text(`Generated: ${format(new Date(), 'yyyy-MM-dd')}`, 196 - doc.getTextWidth(`Generated: ${format(new Date(), 'yyyy-MM-dd')}`), 287);

          doc.addPage();
          pageNum++;
          
          rowY = 20;
          doc.setFillColor(249, 115, 22);
          doc.rect(14, rowY, 182, 1, 'F');
          
          rowY += 3;
          doc.setFillColor(15, 23, 42);
          doc.rect(14, rowY, 182, 8, 'F');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(255, 255, 255);
          doc.text('Employee', 16, rowY + 5.5);
          doc.text('Department', 55, rowY + 5.5);
          doc.text('Dates & Total Days', 85, rowY + 5.5);
          doc.text('Type', 130, rowY + 5.5);
          doc.text('Status', 152, rowY + 5.5);
          doc.text('Reason', 170, rowY + 5.5);

          rowY += 8;
        }

        doc.setFillColor(rowY % 20 === 0 ? 255 : 248, rowY % 20 === 0 ? 255 : 250, rowY % 20 === 0 ? 255 : 252);
        doc.rect(14, rowY, 182, 10, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        
        const empText = l.employeeName.length > 20 ? l.employeeName.substring(0, 18) + '..' : l.employeeName;
        doc.text(empText, 16, rowY + 6);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`#${l.employeeNo || 'No ID'}`, 16, rowY + 9);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(51, 65, 85);
        doc.text(l.department, 55, rowY + 6.5);

        const datesText = `${format(new Date(l.startDate), 'MMM d')} - ${format(new Date(l.endDate), 'MMM d, yy')}`;
        const daysCount = Math.ceil((new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(30, 41, 59);
        doc.text(datesText, 85, rowY + 6);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(249, 115, 22);
        doc.text(`${daysCount} ${daysCount === 1 ? 'day' : 'days'} total`, 85, rowY + 9);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.text(l.type, 130, rowY + 6.5);

        let statusColor = [71, 85, 105];
        if (l.status === 'Approved') statusColor = [16, 185, 129];
        else if (l.status === 'Rejected') statusColor = [239, 68, 68];
        else if (l.status === 'Pending') statusColor = [245, 158, 11];

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
        doc.text(l.status, 152, rowY + 6.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        const reasonText = l.reason && l.reason.length > 18 ? l.reason.substring(0, 16) + '...' : (l.reason || 'No Reason');
        doc.text(reasonText, 170, rowY + 6.5);

        rowY += 10;
      });
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Jaffna University Staff Leave Ledger • HOD Departmental Report • Page ${pageNum}`, 14, 287);
    doc.text(`Generated: ${format(new Date(), 'yyyy-MM-dd')}`, 196 - doc.getTextWidth(`Generated: ${format(new Date(), 'yyyy-MM-dd')}`), 287);

    doc.save(`JaffnaUni_HOD_${user.department || 'Dept'}_Leave_Summary_Report_${hodPdfFilter}.pdf`);
  };

  const handleDownloadStaffReport = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const now = Date.now();
    const rangeDays = staffPdfFilter === '1m' ? 30 : staffPdfFilter === '3m' ? 90 : staffPdfFilter === '6m' ? 180 : 365;
    
    // Only user's own leaves
    const reportLeaves = leaves.filter(l => {
      if (l.employeeId !== user.uid) return false;
      const leaveTime = new Date(l.startDate).getTime();
      const daysDiff = (now - leaveTime) / (1000 * 60 * 60 * 24);
      return Math.abs(daysDiff) <= rangeDays;
    });

    // Sort leaves by start date descending
    reportLeaves.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    let approvedDays = 0;
    let approvedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;
    const typeCounts: Record<string, number> = {
      Annual: 0,
      Sick: 0,
      Personal: 0,
      'Maternity/Paternity': 0,
      Study: 0
    };

    reportLeaves.forEach(l => {
      const duration = Math.ceil((new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (l.status === 'Approved') {
        approvedDays += duration;
        approvedCount++;
      } else if (l.status === 'Pending') {
        pendingCount++;
      } else if (l.status === 'Rejected') {
        rejectedCount++;
      }
      if (typeCounts[l.type] !== undefined) {
        typeCounts[l.type]++;
      }
    });

    const totalRequests = reportLeaves.length;
    const approvalRate = totalRequests > 0 ? Math.round((approvedCount / totalRequests) * 100) : 100;

    // Draw PDF content
    doc.setFillColor(249, 115, 22); // Orange
    doc.rect(14, 15, 182, 1.5, 'F');

    // Title Block
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text('JAFFNA UNIVERSITY', 14, 25);
    
    doc.setFontSize(13);
    doc.setTextColor(71, 85, 105);
    doc.text('STAFF PORTAL - PERSONAL LEAVE SUMMARY REPORT', 14, 31);

    // Meta Info
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    const periodLabel = {
      '1m': '1 Month (Past 30 Days)',
      '3m': '3 Months (Past 90 Days)',
      '6m': '6 Months (Past 180 Days)',
      '1y': '1 Year (Past 365 Days)'
    }[staffPdfFilter];
    doc.text(`Report Timeframe: ${periodLabel}`, 14, 37);
    doc.text(`Generated On: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')} (UTC)`, 14, 41);

    // Right-aligned header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(249, 115, 22);
    doc.text('PERSONAL LEAVE LEDGER', 196 - doc.getTextWidth('PERSONAL LEAVE LEDGER'), 25);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const viewerText = `Staff: ${user.name} (#${user.employeeNo || 'No ID'})`;
    doc.text(viewerText, 196 - doc.getTextWidth(viewerText), 31);

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(14, 45, 196, 45);

    // KPI Blocks
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 49, 42, 22, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, 49, 42, 22, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('APPROVED DAYS', 18, 55);
    doc.setFontSize(16);
    doc.setTextColor(249, 115, 22);
    doc.text(`${approvedDays} Days`, 18, 64);

    doc.setFillColor(248, 250, 252);
    doc.rect(60, 49, 42, 22, 'F');
    doc.rect(60, 49, 42, 22, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('APPROVAL RATE', 64, 55);
    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129);
    doc.text(`${approvalRate}%`, 64, 64);

    doc.setFillColor(248, 250, 252);
    doc.rect(106, 49, 42, 22, 'F');
    doc.rect(106, 49, 42, 22, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('PENDING PIPELINE', 110, 55);
    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246);
    doc.text(`${pendingCount} Apps`, 110, 64);

    doc.setFillColor(248, 250, 252);
    doc.rect(152, 49, 44, 22, 'F');
    doc.rect(152, 49, 44, 22, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('TOTAL APPLICATIONS', 156, 55);
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text(`${totalRequests} Records`, 156, 64);

    // Distribution
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('LEAVE CATEGORY DISTRIBUTION', 14, 79);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Distribution and counts of personal requested leave profiles within this selected period.', 14, 83);

    let chartY = 88;
    Object.entries(typeCounts).forEach(([type, count]) => {
      const percentage = totalRequests > 0 ? count / totalRequests : 0;
      const barMaxWidth = 100;
      const barWidth = percentage * barMaxWidth;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(`${type} Leave`, 14, chartY + 4);

      // Bar BG
      doc.setFillColor(241, 245, 249);
      doc.rect(55, chartY + 1, barMaxWidth, 4, 'F');

      if (barWidth > 0) {
        doc.setFillColor(249, 115, 22);
        doc.rect(55, chartY + 1, barWidth, 4, 'F');
      }

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(`${count} (${Math.round(percentage * 100)}%)`, 160, chartY + 4);

      chartY += 7;
    });

    let tableY = chartY + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('PERSONAL LEAVE LEDGER', 14, tableY);

    tableY += 5;
    doc.setFillColor(15, 23, 42);
    doc.rect(14, tableY, 182, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('Employee', 16, tableY + 5.5);
    doc.text('Department', 55, tableY + 5.5);
    doc.text('Dates & Total Days', 85, tableY + 5.5);
    doc.text('Type', 130, tableY + 5.5);
    doc.text('Status', 152, tableY + 5.5);
    doc.text('Reason', 170, tableY + 5.5);

    let rowY = tableY + 8;
    let pageNum = 1;

    if (reportLeaves.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('No transaction records logged in this timeframe.', 14, rowY + 8);
    } else {
      reportLeaves.forEach((l) => {
        if (rowY > 265) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(148, 163, 184);
          doc.text(`Jaffna University Staff Leave Ledger • Personal Staff Report • Page ${pageNum}`, 14, 287);
          doc.text(`Generated: ${format(new Date(), 'yyyy-MM-dd')}`, 196 - doc.getTextWidth(`Generated: ${format(new Date(), 'yyyy-MM-dd')}`), 287);

          doc.addPage();
          pageNum++;
          
          rowY = 20;
          doc.setFillColor(249, 115, 22);
          doc.rect(14, rowY, 182, 1, 'F');
          
          rowY += 3;
          doc.setFillColor(15, 23, 42);
          doc.rect(14, rowY, 182, 8, 'F');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(255, 255, 255);
          doc.text('Employee', 16, rowY + 5.5);
          doc.text('Department', 55, rowY + 5.5);
          doc.text('Dates & Total Days', 85, rowY + 5.5);
          doc.text('Type', 130, rowY + 5.5);
          doc.text('Status', 152, rowY + 5.5);
          doc.text('Reason', 170, rowY + 5.5);

          rowY += 8;
        }

        doc.setFillColor(rowY % 20 === 0 ? 255 : 248, rowY % 20 === 0 ? 255 : 250, rowY % 20 === 0 ? 255 : 252);
        doc.rect(14, rowY, 182, 10, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        
        const empText = l.employeeName.length > 20 ? l.employeeName.substring(0, 18) + '..' : l.employeeName;
        doc.text(empText, 16, rowY + 6);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`#${l.employeeNo || 'No ID'}`, 16, rowY + 9);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(51, 65, 85);
        doc.text(l.department, 55, rowY + 6.5);

        const datesText = `${format(new Date(l.startDate), 'MMM d')} - ${format(new Date(l.endDate), 'MMM d, yy')}`;
        const daysCount = Math.ceil((new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(30, 41, 59);
        doc.text(datesText, 85, rowY + 6);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(249, 115, 22);
        doc.text(`${daysCount} ${daysCount === 1 ? 'day' : 'days'} total`, 85, rowY + 9);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.text(l.type, 130, rowY + 6.5);

        let statusColor = [71, 85, 105];
        if (l.status === 'Approved') statusColor = [16, 185, 129];
        else if (l.status === 'Rejected') statusColor = [239, 68, 68];
        else if (l.status === 'Pending') statusColor = [245, 158, 11];

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
        doc.text(l.status, 152, rowY + 6.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        const reasonText = l.reason && l.reason.length > 18 ? l.reason.substring(0, 16) + '...' : (l.reason || 'No Reason');
        doc.text(reasonText, 170, rowY + 6.5);

        rowY += 10;
      });
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Jaffna University Staff Leave Ledger • Personal Staff Report • Page ${pageNum}`, 14, 287);
    doc.text(`Generated: ${format(new Date(), 'yyyy-MM-dd')}`, 196 - doc.getTextWidth(`Generated: ${format(new Date(), 'yyyy-MM-dd')}`), 287);

    doc.save(`JaffnaUni_Staff_${user.name.replace(/\s+/g, '_')}_Leave_Summary_Report_${staffPdfFilter}.pdf`);
  };

  const handleDownloadCEOReport = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const now = Date.now();
    const rangeDays = ceoPdfFilter === '1m' ? 30 : ceoPdfFilter === '3m' ? 90 : ceoPdfFilter === '6m' ? 180 : 365;
    
    const reportLeaves = leaves.filter(l => {
      const leaveTime = new Date(l.startDate).getTime();
      const daysDiff = (now - leaveTime) / (1000 * 60 * 60 * 24);
      return Math.abs(daysDiff) <= rangeDays;
    });

    // Sort leaves by start date descending
    reportLeaves.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    let approvedDays = 0;
    let approvedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;
    const typeCounts: Record<string, number> = {
      Annual: 0,
      Sick: 0,
      Personal: 0,
      'Maternity/Paternity': 0,
      Study: 0
    };

    reportLeaves.forEach(l => {
      const duration = Math.ceil((new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (l.status === 'Approved') {
        approvedDays += duration;
        approvedCount++;
      } else if (l.status === 'Pending') {
        pendingCount++;
      } else if (l.status === 'Rejected') {
        rejectedCount++;
      }
      if (typeCounts[l.type] !== undefined) {
        typeCounts[l.type]++;
      }
    });

    const totalRequests = reportLeaves.length;
    const approvalRate = totalRequests > 0 ? Math.round((approvedCount / totalRequests) * 100) : 100;

    // Draw PDF content
    doc.setFillColor(249, 115, 22); // Orange
    doc.rect(14, 15, 182, 1.5, 'F');

    // Title Block
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text('JAFFNA UNIVERSITY', 14, 25);
    
    doc.setFontSize(13);
    doc.setTextColor(71, 85, 105);
    doc.text('CEO OFFICE - EXECUTIVE LEAVE SUMMARY REPORT', 14, 31);

    // Meta Info
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    const periodLabel = {
      '1m': '1 Month (Past 30 Days)',
      '3m': '3 Months (Past 90 Days)',
      '6m': '6 Months (Past 180 Days)',
      '1y': '1 Year (Past 365 Days)'
    }[ceoPdfFilter];
    doc.text(`Report Timeframe: ${periodLabel}`, 14, 37);
    doc.text(`Generated On: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')} (UTC)`, 14, 41);

    // Confidential text right-aligned
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(239, 68, 68);
    doc.text('CONFIDENTIAL / EXECUTIVE PRIVILEGE', 196 - doc.getTextWidth('CONFIDENTIAL / EXECUTIVE PRIVILEGE'), 25);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const viewerText = `Authorized Reviewer: CEO (${user.name})`;
    doc.text(viewerText, 196 - doc.getTextWidth(viewerText), 31);

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(14, 45, 196, 45);

    // KPI Blocks
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 49, 42, 22, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, 49, 42, 22, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('APPROVED DAYS', 18, 55);
    doc.setFontSize(16);
    doc.setTextColor(249, 115, 22);
    doc.text(`${approvedDays} Days`, 18, 64);

    doc.setFillColor(248, 250, 252);
    doc.rect(60, 49, 42, 22, 'F');
    doc.rect(60, 49, 42, 22, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('APPROVAL RATE', 64, 55);
    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129);
    doc.text(`${approvalRate}%`, 64, 64);

    doc.setFillColor(248, 250, 252);
    doc.rect(106, 49, 42, 22, 'F');
    doc.rect(106, 49, 42, 22, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('PENDING PIPELINE', 110, 55);
    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246);
    doc.text(`${pendingCount} Apps`, 110, 64);

    doc.setFillColor(248, 250, 252);
    doc.rect(152, 49, 44, 22, 'F');
    doc.rect(152, 49, 44, 22, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('TOTAL APPLICATIONS', 156, 55);
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text(`${totalRequests} Records`, 156, 64);

    // Distribution
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('LEAVE CATEGORY DISTRIBUTION', 14, 79);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Distribution and counts of all requested leave profiles within this selected period.', 14, 83);

    let chartY = 88;
    Object.entries(typeCounts).forEach(([type, count]) => {
      const percentage = totalRequests > 0 ? count / totalRequests : 0;
      const barMaxWidth = 100;
      const barWidth = percentage * barMaxWidth;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(`${type} Leave`, 14, chartY + 4);

      // Bar BG
      doc.setFillColor(241, 245, 249);
      doc.rect(55, chartY + 1, barMaxWidth, 4, 'F');

      if (barWidth > 0) {
        doc.setFillColor(249, 115, 22);
        doc.rect(55, chartY + 1, barWidth, 4, 'F');
      }

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(`${count} (${Math.round(percentage * 100)}%)`, 160, chartY + 4);

      chartY += 7;
    });

    let tableY = chartY + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('DETAILED INSTITUTIONAL LEAVE LEDGER', 14, tableY);

    tableY += 5;
    doc.setFillColor(15, 23, 42);
    doc.rect(14, tableY, 182, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('Employee', 16, tableY + 5.5);
    doc.text('Department', 55, tableY + 5.5);
    doc.text('Dates & Total Days', 85, tableY + 5.5);
    doc.text('Type', 130, tableY + 5.5);
    doc.text('Status', 152, tableY + 5.5);
    doc.text('Reason', 170, tableY + 5.5);

    let rowY = tableY + 8;
    let pageNum = 1;

    if (reportLeaves.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('No transaction records logged in this timeframe.', 14, rowY + 8);
    } else {
      reportLeaves.forEach((l) => {
        if (rowY > 265) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(148, 163, 184);
          doc.text(`Jaffna University Staff Leave Ledger • CEO Executive Report • Page ${pageNum}`, 14, 287);
          doc.text(`Generated: ${format(new Date(), 'yyyy-MM-dd')}`, 196 - doc.getTextWidth(`Generated: ${format(new Date(), 'yyyy-MM-dd')}`), 287);

          doc.addPage();
          pageNum++;
          
          rowY = 20;
          doc.setFillColor(249, 115, 22);
          doc.rect(14, rowY, 182, 1, 'F');
          
          rowY += 3;
          doc.setFillColor(15, 23, 42);
          doc.rect(14, rowY, 182, 8, 'F');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(255, 255, 255);
          doc.text('Employee', 16, rowY + 5.5);
          doc.text('Department', 55, rowY + 5.5);
          doc.text('Dates & Total Days', 85, rowY + 5.5);
          doc.text('Type', 130, rowY + 5.5);
          doc.text('Status', 152, rowY + 5.5);
          doc.text('Reason', 170, rowY + 5.5);

          rowY += 8;
        }

        doc.setFillColor(rowY % 20 === 0 ? 255 : 248, rowY % 20 === 0 ? 255 : 250, rowY % 20 === 0 ? 255 : 252);
        doc.rect(14, rowY, 182, 10, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        
        const empText = l.employeeName.length > 20 ? l.employeeName.substring(0, 18) + '..' : l.employeeName;
        doc.text(empText, 16, rowY + 6);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`#${l.employeeNo || 'No ID'}`, 16, rowY + 9);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(51, 65, 85);
        doc.text(l.department, 55, rowY + 6.5);

        const datesText = `${format(new Date(l.startDate), 'MMM d')} - ${format(new Date(l.endDate), 'MMM d, yy')}`;
        const daysCount = Math.ceil((new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(30, 41, 59);
        doc.text(datesText, 85, rowY + 6);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(249, 115, 22);
        doc.text(`${daysCount} ${daysCount === 1 ? 'day' : 'days'} total`, 85, rowY + 9);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.text(l.type, 130, rowY + 6.5);

        let statusColor = [71, 85, 105];
        if (l.status === 'Approved') statusColor = [16, 185, 129];
        else if (l.status === 'Rejected') statusColor = [239, 68, 68];
        else if (l.status === 'Pending') statusColor = [245, 158, 11];

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
        doc.text(l.status, 152, rowY + 6.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        const reasonText = l.reason && l.reason.length > 18 ? l.reason.substring(0, 16) + '...' : (l.reason || 'No Reason');
        doc.text(reasonText, 170, rowY + 6.5);

        rowY += 10;
      });
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Jaffna University Staff Leave Ledger • CEO Executive Report • Page ${pageNum}`, 14, 287);
    doc.text(`Generated: ${format(new Date(), 'yyyy-MM-dd')}`, 196 - doc.getTextWidth(`Generated: ${format(new Date(), 'yyyy-MM-dd')}`), 287);

    doc.save(`JaffnaUni_CEO_Leave_Summary_Report_${ceoPdfFilter}.pdf`);
  };

  // CRUD Admin functions
  const handleEditConfirm = async () => {
    if (user.role !== 'admin') {
      alert("Unauthorized: Only Administrators can perform user CRUD operations.");
      return;
    }
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
    if (user.role !== 'admin') {
      alert("Unauthorized: Only Administrators can perform user CRUD operations.");
      return;
    }
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
      
      // Post-approval WhatsApp workflow trigger
      if (showCommentModal.status === 'Approved') {
        const approvedLeave = leaves.find(l => l.id === showCommentModal.id);
        if (approvedLeave) {
          const empProfile = allUsers.find(u => u.uid === approvedLeave.employeeId);
          const empPhone = empProfile?.phone || '';
          const startDateStr = format(new Date(approvedLeave.startDate), 'yyyy-MM-dd');
          const endDateStr = format(new Date(approvedLeave.endDate), 'yyyy-MM-dd');
          
          const defaultMsg = `Hello ${approvedLeave.employeeName}, your leave request (${approvedLeave.type} Leave) from ${startDateStr} to ${endDateStr} has been APPROVED! 📚 - OUSL Leave Management`;
          
          setWhatsappModalData({
            employeeName: approvedLeave.employeeName,
            phone: empPhone,
            message: defaultMsg
          });
        }
      }
      
      setShowCommentModal(null);
      setCommentText('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSliderImage = async () => {
    if (!sliderImageInput.trim()) return;
    setSavingSliderImage(true);
    setSaveSliderSuccess(false);
    try {
      await systemService.updateSliderImage(sliderImageInput.trim());
      setSaveSliderSuccess(true);
      setTimeout(() => setSaveSliderSuccess(false), 3000);
    } catch (e) {
      console.error('Error saving slider image:', e);
    } finally {
      setSavingSliderImage(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50/50 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-5 flex-shrink-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-orange-50 p-2 rounded-xl text-orange-500">
            <LayoutDashboard size={22} />
          </div>
          <div>
            <span className="font-sans font-black text-sm tracking-tight block text-slate-800">{t.staffConsole}</span>
            <span className="text-[9px] text-orange-500 font-sans tracking-widest font-black uppercase">{t.jaffnaUniversity}</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5">
          <SidebarLink 
            icon={LayoutDashboard} 
            label={t.dashboard} 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />



          {/* HOD Approvals Tab */}
          {user.role === 'hod' && (
            <SidebarLink
              icon={UserCheck}
              label={t.staffApprovals}
              active={activeTab === 'approvals'}
              onClick={() => setActiveTab('approvals')}
            />
          )}

          {/* CEO Approvals Tab */}
          {user.role === 'ceo' && (
            <SidebarLink
              icon={CheckCircle}
              label={t.ceoApprovals}
              active={activeTab === 'approvals'}
              onClick={() => setActiveTab('approvals')}
            />
          )}

          {/* Leave Analytics & Reports Tab */}
          {['employee', 'staff', 'hod', 'ceo', 'admin'].includes(user.role) && (
            <SidebarLink
              icon={BarChart3}
              label={t.leaveReports}
              active={activeTab === 'reports'}
              onClick={() => setActiveTab('reports')}
            />
          )}

          {/* Leave History / Total lists */}
          {['employee', 'staff', 'hod', 'ceo', 'admin'].includes(user.role) && (
            <SidebarLink 
              icon={Clock} 
              label={user.role === 'admin' ? t.allLeaveRecords : t.myLeaveHistory} 
              active={activeTab === 'history'} 
              onClick={() => setActiveTab('history')} 
            />
          )}

          {/* Admin Directory Tab */}
          {user.role === 'admin' && (
            <SidebarLink 
              icon={Briefcase} 
              label={t.staffDirectory} 
              active={activeTab === 'admin'} 
              onClick={() => {
                setActiveTab('admin');
              }} 
            />
          )}
        </nav>

        {/* User Card */}
        <div className="pt-5 border-t border-slate-100 mt-auto">
          <div className="bg-orange-50/50 rounded-2xl p-4 mb-4 border border-orange-100/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center font-bold text-white uppercase text-sm">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-extrabold truncate text-slate-800">{user.name}</p>
                <p className="text-[9px] font-mono font-black text-orange-600 uppercase">{user.employeeNo || "No number"}</p>
              </div>
            </div>
            
            <div className="space-y-1 text-[11px] text-slate-600">
               <div className="flex justify-between items-center">
                 <span className="text-slate-400 uppercase tracking-wider text-[8px] font-bold">{t.accessTierLabel}</span>
                 <span className="capitalize font-bold text-orange-600">{user.role}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-slate-400 uppercase tracking-wider text-[8px] font-bold">{t.facultyLabel}</span>
                 <span className="truncate max-w-[100px] font-bold text-slate-800">{user.department}</span>
               </div>
            </div>
          </div>

          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full p-2.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all cursor-pointer"
          >
            <LogOut size={16} />
            <span className="text-xs font-bold">{t.signOut}</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 overflow-y-auto p-8 relative bg-slate-50/50">
        
        {/* Header Block */}
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
          <div>
            <h1 className="text-xl font-sans font-black tracking-tight text-slate-800">
              {activeTab === 'admin' && t.staffDirectoryTitle}
              {activeTab === 'approvals' && (user.role === 'hod' ? t.staffApprovals : t.ceoApprovals)}
              {activeTab === 'history' && (user.role === 'admin' ? t.allLeaveRecords : t.myLeaveHistory)}
              {activeTab === 'reports' && t.leaveReports}
              {activeTab === 'dashboard' && `${t.welcomeBack}, ${user.name}`}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {activeTab === 'admin' && t.staffDirectoryDesc}
              {activeTab === 'approvals' && (user.role === 'hod' ? t.evalQueueDescHOD : t.evalQueueDescCEO)}
              {activeTab === 'history' && (user.role === 'admin' ? t.leaveRecordsLedger : t.myRecentLeaves)}
              {activeTab === 'reports' && t.reportConfigsDesc}
              {activeTab === 'dashboard' && t.facultyPortalVerified}
            </p>
          </div>
          
          {['employee', 'staff', 'hod'].includes(user.role) && (
            <button 
              onClick={() => setIsApplyModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow-md hover:shadow-orange-500/10 transition-all active:scale-95 text-xs cursor-pointer"
            >
              <Plus size={16} /> {t.applyForLeave}
            </button>
          )}
        </header>

        {/* -------------------- TAB: DASHBOARD -------------------- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            
            {/* Quick stats for employees, HODs, and CEOs */}
            {['employee', 'staff', 'hod', 'ceo'].includes(user.role) && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label={t.totalLeaveAllowance} value={stats.total} icon={Calendar} color="blue" suffix={t.days} />
                <StatCard label={t.usedLeavesApproved} value={stats.used} icon={CheckCircle} color="green" suffix={t.days} />
                <StatCard label={t.remainingLeavesUnused} value={stats.remaining} icon={Clock} color="amber" suffix={t.days} />
                <StatCard label={t.pendingLeavesEvaluation} value={stats.pending} icon={AlertCircle} color="slate" suffix={t.records} />
              </div>
            )}

            {/* Profile detail display - locked and non-editable */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-full pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center">
                    <UserIcon size={20} />
                 </div>
                 <div>
                    <h2 className="text-sm font-sans font-black text-slate-800 uppercase tracking-tight">{t.officialStaffProfile}</h2>
                    <p className="text-xs text-slate-500">{t.profileVerifiedInstitutional}</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <ProfileDisplayField label={t.fullLegalName} value={user.name} />
                 <ProfileDisplayField label={t.internalEmail} value={user.email} />
                 <ProfileDisplayField label={t.actingPersonnelID} value={user.employeeNo || "Pending Allocation"} highlight />
                 <ProfileDisplayField label={t.faculty} value={user.department} />
                 <ProfileDisplayField 
                   label={t.accessTier} 
                   value={(user.role === 'employee' || user.role === 'staff') ? t.staffMember : user.role === 'hod' ? t.hodRole : user.role === 'ceo' ? t.ceoRole : t.adminRole} 
                   badge={user.role} 
                 />
                 <ProfileDisplayField label={t.totalLeaveAllowance} value={`${user.totalLeaveDays} ${t.days}`} />
              </div>

              {/* Editable WhatsApp section for standard/non-admin users to update their own contact information */}
              <div className="mt-6 p-4 rounded-2xl bg-orange-50/50 border border-orange-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-orange-500 uppercase tracking-widest flex items-center gap-1.5">
                    My WhatsApp Notification Number
                    {user.phone && user.phoneVerified && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-green-500 text-[8px] font-black uppercase text-white font-mono">
                        ✓ Verified
                      </span>
                    )}
                  </span>
                  <p className="text-xs text-slate-500 font-medium">Provide your active WhatsApp number with country code (e.g. 94771234567) to receive instant leave status updates.</p>
                  {user.phone && user.phone.trim() !== '' && (
                    <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1 mt-1 font-sans">
                      <Lock size={11} />
                      {lang === 'ta' 
                        ? 'சுயவிவரம் சேமிக்கப்பட்டு பூட்டப்பட்டது. மாற்றியமைக்க நிர்வாகியைத் தொடர்பு கொள்ளவும்.' 
                        : lang === 'si' 
                        ? 'සුරැකි සහ අගුළු දමා ඇත. සංශෝධනය කිරීමට පරිපාලක අමතන්න.' 
                        : 'Verified & locked. Contact Admin to make any changes.'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 max-w-sm w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="e.g. 94771234567"
                    disabled={!!(user.phone && user.phone.trim() !== '')}
                    className={`border rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-orange-500 w-full sm:w-48 ${
                      user.phone && user.phone.trim() !== '' ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-white border-slate-200'
                    }`}
                    value={myPhoneInput}
                    onChange={(e) => setMyPhoneInput(e.target.value)}
                  />
                  <button
                    onClick={handleSaveMyPhone}
                    disabled={isSavingPhone || !!(user.phone && user.phone.trim() !== '')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition active:scale-95 whitespace-nowrap flex items-center gap-1.5 ${
                      user.phone && user.phone.trim() !== ''
                        ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600 text-white cursor-pointer'
                    }`}
                  >
                    {isSavingPhone ? (
                      <>
                        <Loader2 size={12} className="animate-spin" /> Saving...
                      </>
                    ) : savePhoneSuccess ? (
                      <>
                        <Check size={12} /> Verified!
                      </>
                    ) : user.phone && user.phone.trim() !== '' ? (
                      <>
                        <Lock size={12} /> Locked
                      </>
                    ) : (
                      'Verify & Save'
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                <div className="flex items-center gap-2">
                   <Lock size={14} className="text-slate-400" />
                   <span>
                     {user.phone && user.phone.trim() !== '' 
                       ? 'Official parameters and contact details are locked. Contact Administrator for modifications.' 
                       : 'Contact details can be self-edited above. Official academic parameters are immutable.'}
                   </span>
                </div>
                <span>Secured via OUSL Network Security System</span>
              </div>
            </div>

            {/* Recent list summary for employees, HODs, and CEOs */}
            {['employee', 'staff', 'hod', 'ceo'].includes(user.role) && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                 <h3 className="font-bold text-slate-800 mb-4 font-sans text-xs uppercase tracking-wider">{t.myRecentLeaves}</h3>
                 {leaves.filter(l => l.employeeId === user.uid).length > 0 ? (
                    <div className="divide-y divide-slate-100">
                       {leaves.filter(l => l.employeeId === user.uid).slice(0, 3).map(rq => (
                          <div key={rq.id} className="py-4 flex justify-between items-center text-sm">
                             <div>
                                <p className="font-bold text-slate-800">{rq.type} Leave</p>
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
                    <p className="text-slate-400 py-6 text-center text-sm">{t.noLeavesFound}</p>
                 )}
              </div>
            )}
          </div>
        )}

        {/* -------------------- TAB: LEAVE HISTORY -------------------- */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
              <h3 className="font-sans font-black text-xs uppercase tracking-wider text-slate-800">
                {user.role === 'admin' ? t.leaveRecordsLedger : t.myLeaveHistory}
              </h3>
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder={t.searchDirectory}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/10"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                </div>
                <select 
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none font-bold text-slate-800 cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">{t.pending}</option>
                  <option value="Approved">{t.approved}</option>
                  <option value="Rejected">{t.rejected}</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">{t.employeeName}</th>
                    <th className="px-6 py-4">{t.leaveType}</th>
                    <th className="px-6 py-4">{t.startDateLabel} - {t.endDateLabel}</th>
                    <th className="px-6 py-4">{t.actingPerson}</th>
                    <th className="px-6 py-4">{t.status}</th>
                    <th className="px-6 py-4 text-right">{t.leaveReason}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeaves.length > 0 ? filteredLeaves.map((leave) => {
                    const actInfo = checkActingPersonConflict(leave);
                    return (
                      <tr key={leave.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm">
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
                               <p className="text-sm font-bold text-slate-800">{actInfo.name}</p>
                               <p className="text-xs text-slate-500 font-mono font-bold">ID: {actInfo.empNo}</p>
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
                           <p className="font-bold text-sm">{t.noTransactionRecords}</p>
                           <p className="text-xs">{t.noTransactionDesc}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* -------------------- TAB: REPORTS -------------------- */}
        {activeTab === 'reports' && (
          <div className="space-y-8 print:p-0">
             {/* CEO Executive Report Center */}
             {user.role === 'ceo' && (
                <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xl relative overflow-hidden">
                   {/* Glowing decorative gradient */}
                   <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                   <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                   
                   <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="space-y-2">
                         <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-400 px-3 py-1.5 rounded-xl border border-orange-500/20 text-[10px] font-mono font-bold uppercase tracking-wider">
                            Executive Privilege
                         </div>
                         <h3 className="font-sans font-black text-lg tracking-tight">CEO Executive Leave Summary Report</h3>
                         <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                            Generate and download a secure corporate PDF ledger summarizing institutional leave requests, department workloads, and employee capacity metrics.
                         </p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                         <div>
                            <span className="block text-[9px] uppercase font-mono font-bold tracking-wider text-slate-400 mb-1.5">Select Timeframe</span>
                            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                               {(['1m', '3m', '6m', '1y'] as const).map((period) => {
                                  const label = {
                                     '1m': '1 Month',
                                     '3m': '3 Months',
                                     '6m': '6 Months',
                                     '1y': '1 Year'
                                  }[period];
                                  const active = ceoPdfFilter === period;
                                  return (
                                     <button
                                       key={period}
                                       type="button"
                                       onClick={() => setCeoPdfFilter(period)}
                                       className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                          active 
                                            ? 'bg-orange-500 text-white shadow-md' 
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                       }`}
                                     >
                                        {label}
                                     </button>
                                  );
                               })}
                            </div>
                         </div>
                         
                         <div className="flex items-end pt-3 sm:pt-0">
                            <button
                              type="button"
                              onClick={handleDownloadCEOReport}
                              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
                            >
                               <Download size={14} /> Download PDF Report
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
             )}

             {/* HOD Departmental Report Center */}
             {user.role === 'hod' && (
                <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xl relative overflow-hidden">
                   {/* Glowing decorative gradient */}
                   <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                   <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                   
                   <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="space-y-2">
                         <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-400 px-3 py-1.5 rounded-xl border border-orange-500/20 text-[10px] font-mono font-bold uppercase tracking-wider">
                            Department Head
                         </div>
                         <h3 className="font-sans font-black text-lg tracking-tight">HOD Departmental Leave Summary Report</h3>
                         <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                            Generate and download a secure departmental PDF ledger summarizing leave requests and team coverage metrics for the {user.department} Faculty.
                         </p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                         <div>
                            <span className="block text-[9px] uppercase font-mono font-bold tracking-wider text-slate-400 mb-1.5">Select Timeframe</span>
                            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                               {([['1m', '1 Month'], ['3m', '3 Months'], ['6m', '6 Months'], ['1y', '12 Months']] as const).map(([period, label]) => {
                                  const active = hodPdfFilter === period;
                                  return (
                                     <button
                                       key={period}
                                       type="button"
                                       onClick={() => setHodPdfFilter(period)}
                                       className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                          active 
                                            ? 'bg-orange-500 text-white shadow-md' 
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                       }`}
                                     >
                                        {label}
                                     </button>
                                  );
                               })}
                            </div>
                         </div>
                         
                         <div className="flex items-end pt-3 sm:pt-0">
                            <button
                              type="button"
                              onClick={handleDownloadHODReport}
                              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
                            >
                               <Download size={14} /> Download PDF Report
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
             )}

             {/* Staff Personal Report Center */}
             {(user.role === 'employee' || user.role === 'staff') && (
                <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xl relative overflow-hidden">
                   {/* Glowing decorative gradient */}
                   <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                   <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                   
                   <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="space-y-2">
                         <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-400 px-3 py-1.5 rounded-xl border border-orange-500/20 text-[10px] font-mono font-bold uppercase tracking-wider">
                            Personal Ledger
                         </div>
                         <h3 className="font-sans font-black text-lg tracking-tight">Staff Personal Leave Summary Report</h3>
                         <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                            Generate and download a secure PDF statement of your personal leave records, approved days, and remaining balances.
                         </p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                         <div>
                            <span className="block text-[9px] uppercase font-mono font-bold tracking-wider text-slate-400 mb-1.5">Select Timeframe</span>
                            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                               {([['1m', '1 Month'], ['3m', '3 Months'], ['6m', '6 Months'], ['1y', '12 Months']] as const).map(([period, label]) => {
                                  const active = staffPdfFilter === period;
                                  return (
                                     <button
                                       key={period}
                                       type="button"
                                       onClick={() => setStaffPdfFilter(period)}
                                       className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                          active 
                                            ? 'bg-orange-500 text-white shadow-md' 
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                       }`}
                                     >
                                        {label}
                                     </button>
                                  );
                               })}
                            </div>
                         </div>
                         
                         <div className="flex items-end pt-3 sm:pt-0">
                            <button
                              type="button"
                              onClick={handleDownloadStaffReport}
                              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
                            >
                               <Download size={14} /> Download PDF Statement
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
             )}

             {/* Report Action Panels */}
             <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                   <h3 className="font-sans font-black text-xs uppercase tracking-wider text-slate-800">{t.reportConfigurations}</h3>
                   <p className="text-xs text-slate-500 mt-1">{t.reportConfigsDesc}</p>
                </div>
                <div className="flex gap-3">
                   <button 
                     onClick={() => window.print()}
                     className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 text-xs transition cursor-pointer"
                   >
                     <Printer size={15} /> {t.printPdfReport}
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
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t.reportTimeframe}</label>
                      {(user.role === 'ceo' || user.role === 'admin') ? (
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
                      ) : user.role === 'hod' ? (
                         <select 
                           value={hodPdfFilter} 
                           onChange={(e: any) => setHodPdfFilter(e.target.value)}
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-navy-900 focus:outline-none"
                         >
                           <option value="1m">1 Month (Past 30 Days)</option>
                           <option value="3m">3 Months (Past 90 Days)</option>
                           <option value="6m">6 Months (Past 180 Days)</option>
                           <option value="1y">12 Months (Past 365 Days)</option>
                         </select>
                      ) : (
                         <select 
                           value={staffPdfFilter} 
                           onChange={(e: any) => setStaffPdfFilter(e.target.value)}
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-navy-900 focus:outline-none"
                         >
                           <option value="1m">1 Month (Past 30 Days)</option>
                           <option value="3m">3 Months (Past 90 Days)</option>
                           <option value="6m">6 Months (Past 180 Days)</option>
                           <option value="1y">12 Months (Past 365 Days)</option>
                         </select>
                      )}
                   </div>

                   {/* Department filter */}
                   <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t.reportDept}</label>
                      {(user.role === 'ceo' || user.role === 'admin') ? (
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
                      ) : (
                         <div className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-xl px-3.5 py-2.5 text-xs font-bold">
                            {user.department || 'N/A'}
                         </div>
                      )}
                   </div>

                   {/* Employee filter */}
                   <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t.reportEmployee}</label>
                      {['admin', 'ceo', 'hod'].includes(user.role) ? (
                         <select 
                           value={reportEmployeeFilter} 
                           onChange={(e) => setReportEmployeeFilter(e.target.value)}
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-navy-900 focus:outline-none"
                         >
                           <option value="All">All Department Employees</option>
                           {allUsers
                             .filter(u => user.role === 'hod' ? u.department === user.department : (reportDeptFilter === 'All' || u.department === reportDeptFilter))
                             .map(u => (
                                <option key={u.uid} value={u.uid}>
                                  {u.name} ({u.employeeNo || 'No ID'})
                                </option>
                             ))
                           }
                         </select>
                      ) : (
                         <div className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-xl px-3.5 py-2.5 text-xs font-bold">
                            {user.name} ({user.employeeNo || 'No ID'})
                         </div>
                      )}
                   </div>

                   {/* Leave Type filter */}
                   <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t.reportLeaveType}</label>
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
                const activePeriod = (user.role === 'ceo' || user.role === 'admin')
                   ? reportPeriod
                   : (user.role === 'hod' ? hodPdfFilter : staffPdfFilter);

                const filteredListByPeriod = leaves.filter(l => {
                   // Role-based structural access boundaries
                   if (user.role === 'hod') {
                      if (l.department !== user.department) return false;
                   } else if (user.role === 'staff' || user.role === 'employee') {
                      if (l.employeeId !== user.uid) return false;
                   }

                   // Timeframe check
                   if (activePeriod !== 'all') {
                      const rangeDays = activePeriod === '1m' ? 30 : activePeriod === '3m' ? 90 : activePeriod === '6m' ? 180 : 365;
                      const leaveTime = new Date(l.startDate).getTime();
                      const daysDiff = (now - leaveTime) / (1000 * 60 * 60 * 24);
                      // Include leaves around the current date window to handle mock entries flexibly
                      if (Math.abs(daysDiff) > rangeDays) return false;
                   }

                   // Department check (only applicable for CEO/Admin, since others are restricted to their own department/id)
                   if ((user.role === 'ceo' || user.role === 'admin') && reportDeptFilter !== 'All' && l.department !== reportDeptFilter) return false;

                   // Employee check
                   if (['admin', 'ceo', 'hod'].includes(user.role)) {
                      if (reportEmployeeFilter !== 'All' && l.employeeId !== reportEmployeeFilter) return false;
                   } else {
                      if (l.employeeId !== user.uid) return false;
                   }

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
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl relative overflow-hidden shadow-sm">
                           <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5">
                              <Calendar size={180} />
                           </div>
                           <p className="text-[10px] font-sans tracking-widest text-orange-100 font-bold uppercase">{t.totalApprovedDays}</p>
                           <p className="text-4xl font-sans font-black mt-2">{approvedDays}</p>
                           <p className="text-xs text-white/60 mt-2 font-medium">Approved calendar leave days</p>
                        </div>

                        <div className="bg-white border border-slate-200 p-6 rounded-3xl relative overflow-hidden shadow-sm">
                           <p className="text-[10px] font-mono tracking-wider text-slate-400 font-bold uppercase">{t.approvalRate}</p>
                           <p className="text-4xl font-sans font-black mt-2 text-slate-800">{approvalRate}%</p>
                           <div className="mt-2.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-emerald-500 h-full" style={{ width: `${approvalRate}%` }} />
                           </div>
                           <p className="text-xs text-slate-500 mt-2 font-medium">{approvedRequests} of {totalRequests} applications</p>
                        </div>

                        <div className="bg-white border border-slate-200 p-6 rounded-3xl relative overflow-hidden shadow-sm">
                           <p className="text-[10px] font-mono tracking-wider text-slate-400 font-bold uppercase">{t.inEvaluationPipeline}</p>
                           <p className="text-4xl font-sans font-black mt-2 text-orange-500">{pendingRequests}</p>
                           <p className="text-xs text-slate-500 mt-2 font-medium">Pending approvals</p>
                        </div>

                        <div className="bg-white border border-slate-200 p-6 rounded-3xl relative overflow-hidden shadow-sm">
                           <p className="text-[10px] font-mono tracking-wider text-slate-400 font-bold uppercase">{t.totalTransactions}</p>
                           <p className="text-4xl font-sans font-black mt-2 text-slate-800">{totalRequests}</p>
                           <p className="text-xs text-slate-500 mt-2 font-medium">Requests in selected timeframe</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Creative Leave Distribution Bar Chart */}
                        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm lg:col-span-5">
                           <h4 className="font-sans font-black text-xs uppercase tracking-wider text-slate-850 mb-6">{t.distributionCategory}</h4>
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
                        <div className="bg-slate-900 text-white/95 p-6 rounded-2xl shadow-sm lg:col-span-7 flex flex-col justify-between">
                           <div>
                              <h4 className="font-sans font-black text-xs uppercase tracking-wider text-orange-400 mb-4">{t.institutionalInsights}</h4>
                              <div className="space-y-4 text-xs font-sans">
                                 <p className="leading-relaxed">
                                    {t.institutionalInsightsDesc}
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
                           <h4 className="font-serif italic font-bold text-navy-900 text-base">{t.leaveRecordsLedger}</h4>
                           <span className="text-[10px] font-mono bg-navy-900/5 text-navy-950 font-bold px-3 py-1 rounded-full">{filteredListByPeriod.length} {t.records}</span>
                        </div>
                        <div className="overflow-x-auto">
                           <table className="w-full text-left border-collapse font-sans">
                              <thead>
                                 <tr className="bg-slate-50 text-[10px] font-mono tracking-wider text-slate-400 uppercase border-b border-slate-100">
                                    <th className="px-6 py-4">{t.employeeName}</th>
                                    <th className="px-6 py-4">{t.reportDept}</th>
                                    <th className="px-6 py-4">{t.startDateLabel} - {t.endDateLabel}</th>
                                    <th className="px-6 py-4">{t.leaveType}</th>
                                    <th className="px-6 py-4">{t.actingPerson}</th>
                                    <th className="px-6 py-4">{t.status}</th>
                                    <th className="px-6 py-4">{t.leaveReason}</th>
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
                                             <FolderMinus size={48} className="opacity-10 text-orange-500" />
                                             <p className="font-bold text-sm">{t.noTransactionRecords}</p>
                                             <p className="text-xs">{t.noTransactionDesc}</p>
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
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div>
                 <h3 className="font-sans font-black text-xs uppercase tracking-wider text-slate-800">{t.evalQueue}</h3>
                 <p className="text-xs text-slate-500 mt-1">
                   {user.role === 'hod' ? t.evalQueueDescHOD : t.evalQueueDescCEO}
                 </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">{t.employeeName}</th>
                    <th className="px-6 py-4">{t.leaveType}</th>
                    <th className="px-6 py-4">{t.startDateLabel} - {t.endDateLabel}</th>
                    <th className="px-6 py-4">{t.actingPerson}</th>
                    <th className="px-6 py-4">{t.leaveReason}</th>
                    <th className="px-6 py-4 text-right">{t.actions}</th>
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
                                {t.approve}
                              </button>
                              <button 
                                onClick={() => setShowCommentModal({ id: leave.id, status: 'Rejected' })}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs shadow-sm transition-all"
                              >
                                {t.reject}
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
                           <p className="text-sm font-bold text-navy-900">{t.noPendingRequests}</p>
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
          <div className="space-y-8 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div>
                <h3 className="font-sans font-black text-xs uppercase tracking-wider text-slate-800">{t.staffDirectoryTitle}</h3>
                <p className="text-xs text-slate-500">{t.staffDirectoryDesc}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
                <button
                  onClick={() => setIsEnrollModalOpen(true)}
                  className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <UserPlus size={14} /> {t.enrollmentSetup}
                </button>
                <div className="w-full md:w-64 relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder={t.searchDirectory}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">{t.employeeName}</th>
                    <th className="px-6 py-4">{t.actingPersonnelID}</th>
                    <th className="px-6 py-4">{t.reportDept}</th>
                    <th className="px-6 py-4">{t.accessTier}</th>
                    <th className="px-6 py-4">WhatsApp Status</th>
                    <th className="px-6 py-4">{t.remainingDays}</th>
                    <th className="px-6 py-4 text-right">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {allUsers.filter(u => (u.name || '').toLowerCase().includes(filter.toLowerCase()) || (u.employeeNo || '').toLowerCase().includes(filter.toLowerCase())).length > 0 ? (
                    allUsers.filter(u => (u.name || '').toLowerCase().includes(filter.toLowerCase()) || (u.employeeNo || '').toLowerCase().includes(filter.toLowerCase())).map((usr) => (
                      <tr key={usr.uid} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs uppercase">
                              {usr.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{usr.name}</p>
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
                            {(usr.role === 'employee' || usr.role === 'staff') ? t.staffMember : usr.role === 'hod' ? t.hodRole : usr.role === 'ceo' ? t.ceoRole : t.adminRole}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {usr.phone ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-800">
                                <span>+{usr.phone}</span>
                                {usr.phoneVerified ? (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-green-500 text-[9px] text-white font-sans font-bold uppercase">
                                    <Check size={10} strokeWidth={3} /> Verified
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-[9px] text-amber-600 font-sans font-bold uppercase">
                                    Unverified
                                  </span>
                                )}
                              </div>
                              {usr.phoneVerified && usr.phoneVerifiedAt && (
                                <p className="text-[10px] text-slate-400 font-medium font-sans">
                                  Verified at: {usr.phoneVerifiedAt}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Not Registered</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-navy-900">
                          {usr.totalLeaveDays} {t.days}
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
                      <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                        No staff matching your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Slider Area Background Cover Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-50 p-2 rounded-xl text-orange-500">
                <Calendar size={20} />
              </div>
              <div>
                <h3 className="font-sans font-black text-xs uppercase tracking-wider text-slate-800 font-bold">Slider Background Image Cover</h3>
                <p className="text-xs text-slate-500 font-medium">Update the background image displayed behind "Jaffna University Sri Lanka" in the landing page hero slider section.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
              {/* Left column: Input and controls */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 px-1">Cover Image URL</label>
                  <input 
                    type="text" 
                    placeholder="https://images.unsplash.com/photo-..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 font-mono text-xs"
                    value={sliderImageInput}
                    onChange={(e) => setSliderImageInput(e.target.value)}
                  />
                </div>

                {/* Preset Campus Images */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Or choose a pre-selected university cover:</span>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        name: "Academic Library",
                        url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1000&auto=format&fit=crop"
                      },
                      {
                        name: "Campus Gate",
                        url: "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=1000&auto=format&fit=crop"
                      },
                      {
                        name: "Study Hall",
                        url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop"
                      }
                    ].map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setSliderImageInput(preset.url)}
                        className={`group relative h-16 rounded-xl overflow-hidden border-2 transition-all ${sliderImageInput === preset.url ? 'border-orange-500 shadow-md ring-2 ring-orange-500/20' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                          <span className="text-[9px] font-semibold text-white truncate w-full text-left">{preset.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <button
                    disabled={savingSliderImage || !sliderImageInput.trim()}
                    onClick={handleSaveSliderImage}
                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow-md hover:shadow-orange-500/10 transition-all active:scale-95 text-xs cursor-pointer"
                  >
                    {savingSliderImage ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Check size={14} /> Save Cover Image
                      </>
                    )}
                  </button>

                  {saveSliderSuccess && (
                    <span className="text-xs font-bold text-green-600 flex items-center gap-1 animate-fade-in">
                      <CheckCircle2 size={14} className="text-green-600" /> Successfully updated and published cover!
                    </span>
                  )}
                </div>
              </div>

              {/* Right column: Live Interactive preview */}
              <div className="relative rounded-2xl overflow-hidden bg-navy-950 border border-slate-200 aspect-[21/9] flex items-center p-6 shadow-inner group">
                <div className="absolute inset-0 z-0">
                  <img 
                    src={sliderImageInput || "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2070&auto=format&fit=crop"} 
                    alt="Slider Preview" 
                    className="w-full h-full object-cover opacity-40 scale-105 transition-all duration-300 group-hover:scale-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/20 to-transparent" />
                </div>
                <div className="relative z-10 w-full">
                  <div className="inline-block px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-full text-[8px] font-bold uppercase tracking-widest mb-2 border border-amber-500/20">
                    Academic Excellence
                  </div>
                  <h1 className="text-base sm:text-lg font-sans font-black text-white leading-tight uppercase tracking-tight">
                    Jaffna University Sri Lanka
                  </h1>
                  <p className="text-[10px] text-slate-200 mt-1 max-w-[80%] font-medium opacity-80">
                    Empowering Minds, Shaping the Future
                  </p>
                </div>
                <div className="absolute top-3 right-3 bg-navy-900/80 backdrop-blur-sm text-[9px] text-slate-300 font-mono px-2.5 py-1 rounded-full border border-white/10">
                  Live Preview
                </div>
              </div>
            </div>
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

      {/* ----------------- MODAL: ENROLL NEW PROFILE ----------------- */}
      <AnimatePresence>
        {isEnrollModalOpen && user.role === 'admin' && (
          <EnrollModal 
            currentUserRole={user.role}
            onClose={() => setIsEnrollModalOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* ----------------- MODAL: ADMIN EDIT ----------------- */}
      <AnimatePresence>
        {editingUser && user.role === 'admin' && (
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
                <h3 className="text-xl font-serif font-bold text-navy-900">{t.modifyFacultyProfile}</h3>
                <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-navy-900">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Employee Number - Locked & Read Only */}
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t.actingPersonnelID} (Immutable ID)</label>
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
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t.fullLegalName}</label>
                   <input 
                     type="text" 
                     className="input-field" 
                     value={editingUser.name}
                     onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                   />
                </div>

                {/* Email (Read Only too block accidental changes) */}
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t.internalEmail}</label>
                   <input 
                     type="text" 
                     disabled
                     className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500" 
                     value={editingUser.email}
                   />
                </div>

                {/* Access Level */}
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t.accessTier}</label>
                   <select 
                     className="input-field bg-white"
                     value={editingUser.role}
                     onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                   >
                     <option value="employee">{t.staffMember}</option>
                     <option value="hod">{t.hodRole}</option>
                     <option value="ceo">{t.ceoRole}</option>
                     <option value="admin">{t.adminRole}</option>
                   </select>
                </div>

                {/* Department Faculty */}
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t.faculty}</label>
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
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t.totalLeaveAllowance}</label>
                   <input 
                     type="number" 
                     className="input-field" 
                     value={editingUser.totalLeaveDays}
                     onChange={(e) => setEditingUser({ ...editingUser, totalLeaveDays: Number(e.target.value) })}
                   />
                </div>

                {/* WhatsApp Mobile */}
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">WhatsApp Mobile (e.g. 94771234567)</label>
                   <input 
                     type="text" 
                     className="input-field font-mono" 
                     placeholder="e.g. 94771234567"
                     value={editingUser.phone || ''}
                     onChange={(e) => {
                       const val = e.target.value.replace(/[^0-9]/g, '');
                       setEditingUser({ ...editingUser, phone: val });
                     }}
                   />
                </div>

                {/* Verification Toggle */}
                {editingUser.phone && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Mark Number as Verified</span>
                      <button
                        type="button"
                        onClick={() => {
                          const isVerified = !editingUser.phoneVerified;
                          const timestamp = isVerified ? format(new Date(), 'yyyy-MM-dd HH:mm:ss') : '';
                           setEditingUser({
                             ...editingUser,
                             phoneVerified: isVerified,
                             phoneVerifiedAt: timestamp
                           });
                        }}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          editingUser.phoneVerified ? 'bg-green-600' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            editingUser.phoneVerified ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    {editingUser.phoneVerified && (
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Verification Date & Time</label>
                        <input
                          type="text"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-semibold text-slate-700"
                          value={editingUser.phoneVerifiedAt || format(new Date(), 'yyyy-MM-dd HH:mm:ss')}
                          onChange={(e) => setEditingUser({ ...editingUser, phoneVerifiedAt: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-slate-100 font-bold hover:bg-slate-200 py-3 rounded-2xl text-sm"
                >
                  {t.cancel}
                </button>
                <button 
                  onClick={() => {
                    setUserToConfirmEdit({
                      id: editingUser.uid,
                      data: {
                        name: editingUser.name,
                        role: editingUser.role,
                        department: editingUser.department,
                        totalLeaveDays: editingUser.totalLeaveDays,
                        phone: editingUser.phone || '',
                        phoneVerified: editingUser.phoneVerified || false,
                        phoneVerifiedAt: editingUser.phoneVerifiedAt || ''
                      }
                    });
                  }}
                  className="flex-1 bg-navy-900 text-white font-bold hover:bg-navy-800 py-3 rounded-2xl text-sm"
                >
                  {t.saveProfiles}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------------- CONFIRMATION: EDIT PROFILE ---------------- */}
      <AnimatePresence>
        {userToConfirmEdit && user.role === 'admin' && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50" />
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white p-6 rounded-3xl max-w-sm w-full relative z-10 text-center"
            >
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} />
              </div>
              <h4 className="text-lg font-bold text-navy-900 mb-2">{t.confirmEditAction}</h4>
              <p className="text-sm text-slate-500 mb-6">Are you sure you want to save these profile changes? The staff's departmental parameters will be saved.</p>
              <div className="flex gap-2">
                <button onClick={() => setUserToConfirmEdit(null)} className="flex-1 py-2.5 bg-slate-100 font-bold rounded-xl text-sm">{t.cancel}</button>
                <button onClick={handleEditConfirm} className="flex-1 py-2.5 bg-navy-900 text-white font-semibold rounded-xl text-sm">{t.saveProfiles}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------------- CONFIRMATION: DELETE PROFILE ---------------- */}
      <AnimatePresence>
        {userToDelete && user.role === 'admin' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setUserToDelete(null)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white p-6 rounded-3xl max-w-sm w-full relative z-10 text-center"
            >
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h4 className="text-lg font-bold text-navy-900 mb-2">{t.confirmDeletion}</h4>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to permanently delete <strong>{userToDelete.name}</strong> ({userToDelete.employeeNo}) from the university staff directory? This action is irreversible.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setUserToDelete(null)} className="flex-1 py-2.5 bg-slate-100 font-bold rounded-xl text-sm">{t.cancel}</button>
                <button onClick={handleDeleteConfirm} className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl text-sm">{t.deleteBtn}</button>
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
                {t.comments} ({showCommentModal.status})
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
                <button onClick={() => setShowCommentModal(null)} className="flex-1 py-2.5 bg-slate-100 font-bold rounded-xl text-sm">{t.cancel}</button>
                <button 
                  onClick={handleUpdateStatusConfirm} 
                  className={`flex-1 py-2.5 text-white font-bold rounded-xl text-sm ${showCommentModal.status === 'Approved' ? 'bg-green-600' : 'bg-red-600'}`}
                >
                  {showCommentModal.status === 'Approved' ? t.approve : t.reject}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------- MODAL: WHATSAPP NOTIFICATION ----------------- */}
      <AnimatePresence>
        {whatsappModalData && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setWhatsappModalData(null)} 
              className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden p-8 border border-green-100"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
                  <svg className="w-8 h-8 fill-current text-green-600" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <h3 className="text-lg font-serif font-black text-navy-900">Send WhatsApp Notification</h3>
                <p className="text-xs text-slate-500 mt-1">Send a prefilled instant notification to this employee's WhatsApp mobile.</p>
              </div>

              <div className="space-y-4">
                {/* Employee WhatsApp Number */}
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">WhatsApp Mobile (with Country Code)</label>
                   <input 
                     type="text" 
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-green-500" 
                     placeholder="e.g. 94771234567"
                     value={whatsappModalData.phone}
                     onChange={(e) => setWhatsappModalData({ ...whatsappModalData, phone: e.target.value })}
                   />
                   <p className="text-[9px] text-slate-400 mt-1">Must start with country code (94 for Sri Lanka) with no "+" prefix or spaces.</p>
                </div>

                {/* Prefilled message */}
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Notification Message</label>
                   <textarea 
                     rows={4}
                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-medium text-slate-700 focus:outline-none focus:border-green-500 resize-none"
                     value={whatsappModalData.message}
                     onChange={(e) => setWhatsappModalData({ ...whatsappModalData, message: e.target.value })}
                   />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setWhatsappModalData(null)}
                  className="flex-1 bg-slate-100 font-bold hover:bg-slate-200 py-3 rounded-2xl text-xs text-slate-600"
                >
                  Skip Notification
                </button>
                <button 
                  onClick={() => {
                    const cleanPhone = whatsappModalData.phone.replace(/[^0-9]/g, '');
                    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappModalData.message)}`;
                    window.open(url, '_blank');
                    setWhatsappModalData(null);
                  }}
                  disabled={!whatsappModalData.phone.trim()}
                  className="flex-1 bg-green-600 text-white font-bold hover:bg-green-700 disabled:bg-slate-300 py-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Open WhatsApp
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------- MODAL: WHATSAPP OTP VERIFICATION ----------------- */}
      <AnimatePresence>
        {verificationOtp && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setVerificationOtp(null)} 
              className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden p-8 border border-green-100"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
                  <svg className="w-8 h-8 fill-current text-green-600" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <h3 className="text-lg font-sans font-black text-slate-800 uppercase tracking-tight">WhatsApp Verification</h3>
                <p className="text-xs text-slate-500 mt-1">We have generated and dispatched a 6-digit secure system verification code to your WhatsApp device.</p>
              </div>

              {/* SIMULATED INCOMING WHATSAPP MESSAGE (Brilliant UX) */}
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 shadow-sm flex gap-3 relative overflow-hidden text-left"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500" />
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  WA
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Simulated Phone Gateway</span>
                    <span className="text-[9px] text-slate-400 font-mono">Just Now</span>
                  </div>
                  <p className="text-[11px] text-slate-800 font-semibold leading-relaxed">
                    💬 <span className="font-bold text-green-800">OUSL Leave Management:</span> Your security code is <span className="font-mono font-black text-xs text-green-900 bg-green-200/60 px-1.5 py-0.5 rounded">{verificationOtp.code}</span>. Use this code to complete verification.
                  </p>
                </div>
              </motion.div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 text-center">Enter 6-Digit Code</label>
                  <input 
                    type="text" 
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setOtpInput(val);
                      setVerificationError('');
                    }}
                    placeholder="E.g. 123456"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-lg font-mono font-bold tracking-[0.5em] text-slate-800 focus:outline-none focus:border-green-500"
                  />
                  {verificationError && (
                    <p className="text-[10px] text-red-500 mt-1.5 text-center font-bold font-sans">{verificationError}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => setVerificationOtp(null)}
                  className="flex-1 bg-slate-100 font-bold hover:bg-slate-200 py-3 rounded-2xl text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleVerifyCode}
                  disabled={otpInput.length !== 6}
                  className="flex-1 bg-green-600 text-white font-bold hover:bg-green-700 disabled:bg-slate-300 py-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer font-sans"
                >
                  <Check size={14} /> Verify & Complete
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
    className={`flex items-center gap-3 w-full p-2.5 rounded-xl transition-all font-sans font-bold text-xs tracking-wide cursor-pointer ${
      active ? 'bg-orange-500 text-white shadow-sm scale-[1.02]' : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50/50'
    }`}
  >
    <Icon size={16} />
    <span className="text-[13px]">{label}</span>
  </button>
);

const StatCard = ({ label, value, icon: Icon, color, suffix }: { label: string, value: number, icon: any, color: 'blue' | 'amber' | 'green' | 'slate', suffix: string }) => {
  const colors = {
    blue: 'text-orange-600 bg-orange-50 border-orange-100',
    amber: 'text-orange-600 bg-orange-50 border-orange-105',
    green: 'text-green-600 bg-green-50 border-green-100',
    slate: 'text-slate-600 bg-slate-50 border-slate-100',
  };
  return (
    <div className={`p-6 rounded-2xl border border-slate-200/60 bg-white shadow-sm flex flex-col justify-between h-32`}>
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon size={16} />
        </div>
      </div>
      <div>
         <span className="text-2xl font-sans font-black text-slate-800">{value}</span>
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
  const { lang, t } = useContext(LanguageContext);
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
  const [isAutoRejected, setIsAutoRejected] = useState(false);
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

    const isDeptMismatch = matchedProfile.department?.trim().toLowerCase() !== user.department?.trim().toLowerCase();
    let submitStatus: LeaveStatus = 'Pending';
    let autoComment = '';

    if (isDeptMismatch) {
      submitStatus = 'Rejected';
      autoComment = `[SYSTEM AUTO-REJECT] Acting Personnel Department Mismatch. Nominated acting officer "${matchedProfile.name}" belongs to "${matchedProfile.department}", which does not match your department ("${user.department}"). All acting staff must be from the same department.`;
      setIsAutoRejected(true);
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
        actingEmployeeNo: formData.actingEmployeeNo.trim(),
        status: submitStatus,
        adminComment: autoComment
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, isDeptMismatch ? 5000 : 2500);
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
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-xl rounded-2xl shadow-xl relative z-10 border border-orange-100 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 text-white/70 hover:text-white cursor-pointer">
            <X size={20} />
          </button>
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
            <Plus size={24} className="text-white" />
          </div>
          <h2 className="text-xl font-sans font-black uppercase tracking-tight mb-1">{t.newLeaveRequest}</h2>
          <p className="text-white/80 text-xs">{t.fillLeaveForm}</p>
        </div>

        {submitted ? (
          <div className="p-16 text-center">
            {isAutoRejected ? (
              <>
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md shadow-red-500/15"
                >
                  <X size={28} strokeWidth={3} />
                </motion.div>
                <h3 className="text-lg font-sans font-black uppercase text-red-600 mb-2">
                  {lang === 'ta' ? 'தானியங்கி நிராகரிப்பு!' : lang === 'si' ? 'ස්වයංක්‍රීයව ප්‍රතික්ෂේප විය!' : 'Auto-Rejected!'}
                </h3>
                <p className="text-slate-500 max-w-sm mx-auto text-xs leading-relaxed mb-6 font-medium">
                  {lang === 'ta' 
                    ? 'பதிலாள் அதிகாரி வேறு துறையைச் சேர்ந்தவர் என்பதால் இந்த விடுப்பு கோரிக்கை முறைமையால் தானாகவே நிராகரிக்கப்பட்டது. விவரங்களை உங்கள் விடுப்பு வரலாற்றில் பார்க்கவும்.'
                    : lang === 'si'
                    ? 'වැඩබලන නිලධාරියා වෙනත් දෙපාර්තමේන්තුවක බැවින් මෙම නිවාඩු ඉල්ලීම පද්ධතිය විසින් ස්වයංක්‍රීයව ප්‍රතික්ෂේප කරන ලදී. විස්තර ඔබගේ නිවාඩු ඉතිහාසයෙන් බලාගන්න.'
                    : 'This leave request has been automatically rejected because the nominated acting officer belongs to a different department. Please review the details in your Leave History.'}
                </p>
              </>
            ) : (
              <>
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md shadow-emerald-500/15"
                >
                  <Check size={28} strokeWidth={3} />
                </motion.div>
                <h3 className="text-lg font-sans font-black uppercase text-slate-800 mb-2">{t.requestLogged}</h3>
                <p className="text-slate-400 max-w-xs mx-auto text-xs leading-relaxed mb-6">
                  {t.requestLoggedDesc}
                </p>
              </>
            )}
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
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">{t.startDateLabel}</label>
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
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">{t.endDateLabel}</label>
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
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">{t.leaveType}</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {['Annual', 'Sick', 'Personal', 'Maternity/Paternity', 'Study'].map((type) => (
                  <button 
                    key={type}
                    type="button"
                    onClick={() => setFormData({...formData, type: type as LeaveType})}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      formData.type === type ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-orange-500'
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
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">{t.actingPersonnelID}</label>
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
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">{t.leaveReason}</label>
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
                t.submitRequest
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

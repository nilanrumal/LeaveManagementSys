export type Language = 'en' | 'ta' | 'si';

export interface Translation {
  // Landing Page / Common
  title: string;
  subtitle: string;
  staffPortal: string;
  applyNow: string;
  leaveSystem: string;
  jaffnaUniversity: string;
  login: string;
  requestAccess: string;
  academicExcellence: string;
  enterPortalGateway: string;
  staffAuthenticator: string;
  excellenceInAction: string;
  worldClassFaculty: string;
  worldClassFacultyDesc: string;
  globalResearch: string;
  globalResearchDesc: string;
  industryLeadership: string;
  industryLeadershipDesc: string;
  studentSuccess: string;
  studentSuccessDesc: string;
  professionalAdministration: string;
  professionalAdministrationDesc: string;
  newAccount: string;
  enrollmentSetup: string;
  createStaffProfile: string;
  createHodProfile: string;
  createCeoProfile: string;
  createAdminProfile: string;
  copyright: string;
  privacy: string;
  security: string;
  standards: string;
  loadingSecure: string;
  secureGateway: string;
  
  // Auth Modal
  staffAuthentication: string;
  universityEnrollment: string;
  accessSecureSystem: string;
  fullLegalName: string;
  accessTier: string;
  staffMember: string;
  hodRole: string;
  ceoRole: string;
  adminRole: string;
  faculty: string;
  internalEmail: string;
  securityCredentials: string;
  secureLogin: string;
  createProfile: string;
  dontHaveCredentials: string;
  alreadyVerified: string;
  returnToLogin: string;

  // Portal Common / Sidebar
  staffConsole: string;
  dashboard: string;
  applyForLeave: string;
  staffApprovals: string;
  ceoApprovals: string;
  leaveReports: string;
  allLeaveRecords: string;
  myLeaveHistory: string;
  staffDirectory: string;
  signOut: string;
  accessTierLabel: string;
  facultyLabel: string;
  remainingDays: string;

  // Portal Dashboard
  welcomeBack: string;
  facultyPortalVerified: string;
  academicLeaveStatistics: string;
  totalLeaveAllowance: string;
  usedLeavesApproved: string;
  pendingLeavesEvaluation: string;
  remainingLeavesUnused: string;
  quickLeaveOverview: string;
  noLeavesFound: string;
  requestLeaveFormTitle: string;
  requestLeaveFormDesc: string;
  officialStaffProfile: string;
  profileVerifiedInstitutional: string;
  myRecentLeaves: string;
  approvedDays: string;
  days: string;
  pending: string;
  approved: string;
  rejected: string;

  // Portal Reports
  reportConfigurations: string;
  reportConfigsDesc: string;
  printPdfReport: string;
  reportTimeframe: string;
  reportDept: string;
  reportEmployee: string;
  reportLeaveType: string;
  totalApprovedDays: string;
  approvalRate: string;
  inEvaluationPipeline: string;
  totalTransactions: string;
  distributionCategory: string;
  institutionalInsights: string;
  institutionalInsightsDesc: string;
  leaveRecordsLedger: string;
  records: string;
  employeeName: string;
  actingPerson: string;
  startDate: string;
  endDate: string;
  status: string;
  noTransactionRecords: string;
  noTransactionDesc: string;

  // Portal Approvals
  evalQueue: string;
  evalQueueDescHOD: string;
  evalQueueDescCEO: string;
  doubleBooked: string;
  onApprovedLeave: string;
  actionRequired: string;
  noPendingRequests: string;
  approve: string;
  reject: string;
  comments: string;
  decisionHeader: string;
  saveDecision: string;
  cancel: string;

  // Portal Staff Directory (Admin)
  staffDirectoryTitle: string;
  staffDirectoryDesc: string;
  searchDirectory: string;
  creationDate: string;
  actions: string;
  modifyFacultyProfile: string;
  confirmEditAction: string;
  saveProfiles: string;
  confirmDeletion: string;
  deleteBtn: string;

  // Leave Form
  newLeaveRequest: string;
  fillLeaveForm: string;
  leaveType: string;
  startDateLabel: string;
  endDateLabel: string;
  actingPersonnelID: string;
  leaveReason: string;
  submitting: string;
  submitRequest: string;
  requestLogged: string;
  requestLoggedDesc: string;
}

export const translations: Record<Language, Translation> = {
  en: {
    title: "Jaffna University Sri Lanka",
    subtitle: "Empowering Minds, Shaping the Future",
    staffPortal: "Staff Portal",
    applyNow: "Apply Now",
    leaveSystem: "Leave Management System",
    jaffnaUniversity: "JAFFNA UNIVERSITY",
    login: "Login",
    requestAccess: "Request Access",
    academicExcellence: "Academic Excellence & Leadership",
    enterPortalGateway: "Enter Portal Gateway",
    staffAuthenticator: "Staff Authenticator",
    excellenceInAction: "Excellence in Action",
    worldClassFaculty: "World-Class Faculty & Research",
    worldClassFacultyDesc: "Our commitment to academic rigor and innovative research drives global impact and prepares students for a rapidly changing future.",
    globalResearch: "Global Research",
    globalResearchDesc: "Over 40 international research centers focused on sustainable development and AI ethics.",
    industryLeadership: "Industry Leadership",
    industryLeadershipDesc: "Direct partnerships with Fortune 500 companies for internships and executive mentoring.",
    studentSuccess: "Student Success",
    studentSuccessDesc: "A dedicated career center with a 98% employment rate for graduates within 6 months.",
    professionalAdministration: "Professional Staff Administration",
    professionalAdministrationDesc: "Unlock specialized leave management, departmental data, and administrative coordination tools designed for efficiency and transparency.",
    newAccount: "New Account",
    enrollmentSetup: "Enrollment Portal Setup:",
    createStaffProfile: "Create Staff Profile",
    createHodProfile: "Create HOD Profile",
    createCeoProfile: "Create CEO Profile",
    createAdminProfile: "Create Admin Profile",
    copyright: "© 2026 Jaffna University Sri Lanka. Secure Staff Directory Portal. All staff actions are audited for security compliance.",
    privacy: "Privacy",
    security: "Security",
    standards: "Standards",
    loadingSecure: "JAFFNA UNIVERSITY",
    secureGateway: "Secure Gateway",
    
    // Auth Modal
    staffAuthentication: "Staff Authentication",
    universityEnrollment: "University Enrollment",
    accessSecureSystem: "Access the secure leave management ecosystem.",
    fullLegalName: "Full Legal Name",
    accessTier: "Access Tier",
    staffMember: "Staff Member",
    hodRole: "HOD (Head of Department)",
    ceoRole: "CEO",
    adminRole: "Administrator",
    faculty: "Faculty",
    internalEmail: "Internal Email",
    securityCredentials: "Security Credentials",
    secureLogin: "Secure Login",
    createProfile: "Create Profile",
    dontHaveCredentials: "Don't have credentials?",
    alreadyVerified: "Already verified?",
    returnToLogin: "Return to Login",

    // Portal Common / Sidebar
    staffConsole: "Staff Console",
    dashboard: "Dashboard",
    applyForLeave: "Apply for Leave",
    staffApprovals: "Staff Approvals",
    ceoApprovals: "CEO HOD Approvals",
    leaveReports: "Leave Reports",
    allLeaveRecords: "All Leave Records",
    myLeaveHistory: "My Leave History",
    staffDirectory: "Staff Directory",
    signOut: "Sign Out",
    accessTierLabel: "Access Tier:",
    facultyLabel: "Faculty/Dept:",
    remainingDays: "Remaining Allowance",

    // Portal Dashboard
    welcomeBack: "Welcome back",
    facultyPortalVerified: "Faculty Portal Verified. Security protocols active.",
    academicLeaveStatistics: "Academic Leave Statistics",
    totalLeaveAllowance: "Total Leave Allowance",
    usedLeavesApproved: "Used Leaves (Approved)",
    pendingLeavesEvaluation: "Pending (In Evaluation)",
    remainingLeavesUnused: "Remaining Leaves (Unused)",
    quickLeaveOverview: "Quick Leaves Overview",
    noLeavesFound: "No leave transactions logged on campus yet.",
    requestLeaveFormTitle: "Need to step away from academic duty?",
    requestLeaveFormDesc: "Submit an encrypted leave application specifying dates and designated acting faculty member.",
    officialStaffProfile: "Official Staff Profile",
    profileVerifiedInstitutional: "Verified institutional data. Modification strictly limited to system administrators.",
    myRecentLeaves: "My Recent Leaves",
    approvedDays: "Total Approved Days",
    days: "Days",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",

    // Portal Reports
    reportConfigurations: "Report Configurations",
    reportConfigsDesc: "Specify parameters to isolate departments, employee nodes, and timeframes.",
    printPdfReport: "Print/PDF Report",
    reportTimeframe: "Report Timeframe",
    reportDept: "Department",
    reportEmployee: "Staff Node",
    reportLeaveType: "Leave Category",
    totalApprovedDays: "Total Approved Days",
    approvalRate: "Approval Rate",
    inEvaluationPipeline: "In Evaluation Pipeline",
    totalTransactions: "Total Transactions",
    distributionCategory: "Distribution by Leave Category",
    institutionalInsights: "Institutional Insights Summary",
    institutionalInsightsDesc: "This visual report consolidates active leave datasets within your faculty department. Academic personnel resource availability is tracked dynamically against ongoing academic and administrative schedules.",
    leaveRecordsLedger: "Leave Records Table Ledger",
    records: "Records",
    employeeName: "Employee Name",
    actingPerson: "Acting Person",
    startDate: "Start Date",
    endDate: "End Date",
    status: "Status",
    noTransactionRecords: "No transaction records in this interval.",
    noTransactionDesc: "Loosen filters to load historical data logs.",

    // Portal Approvals
    evalQueue: "Leave Requests Awaiting Your Evaluation",
    evalQueueDescHOD: "Standard Employees requests. Showing acting-person real-time calendars.",
    evalQueueDescCEO: "HOD requests. Executive final review.",
    doubleBooked: "Double-booked!",
    onApprovedLeave: "On approved leave",
    actionRequired: "Action Required: Acting personnel conflict detected",
    noPendingRequests: "No pending requests require your attention.",
    approve: "Approve",
    reject: "Reject",
    comments: "Evaluation Comments",
    decisionHeader: "Confirm Evaluation Decision",
    saveDecision: "Save Decision",
    cancel: "Cancel",

    // Portal Staff Directory (Admin)
    staffDirectoryTitle: "University Staff Directory",
    staffDirectoryDesc: "Edit access tiers, department faculty, or delete profiles from the central directory database.",
    searchDirectory: "Search by name, email, or ID...",
    creationDate: "Creation Date",
    actions: "Actions",
    modifyFacultyProfile: "Modify Faculty Profile",
    confirmEditAction: "Confirm Edit Action",
    saveProfiles: "Save Profile",
    confirmDeletion: "Confirm Deletion",
    deleteBtn: "Delete Profile",

    // Leave Form
    newLeaveRequest: "New Leave Request",
    fillLeaveForm: "Fill in dates and designate acting personnel on campus.",
    leaveType: "Leave Type",
    startDateLabel: "Start Date",
    endDateLabel: "End Date",
    actingPersonnelID: "Acting Personnel (Employee ID)",
    leaveReason: "Reason for Leave",
    submitting: "Submitting...",
    submitRequest: "Submit Request",
    requestLogged: "Request Logged",
    requestLoggedDesc: "Your leave request has been submitted to authorized leaders for calendar checks."
  },
  ta: {
    title: "யாழ்ப்பாணப் பல்கலைக்கழகம் இலங்கை",
    subtitle: "அறிவை மேம்படுத்தி, எதிர்காலத்தை வடிவமைப்போம்",
    staffPortal: "பணியாளர் போர்டல்",
    applyNow: "இப்போது விண்ணப்பிக்கவும்",
    leaveSystem: "விடுமுறை மேலாண்மை அமைப்பு",
    jaffnaUniversity: "யாழ்ப்பாணப் பல்கலைக்கழகம்",
    login: "உள்நுழைவு",
    requestAccess: "அணுகல் கோரிக்கை",
    academicExcellence: "கல்விச் சிறப்பு மற்றும் தலைமைத்துவம்",
    enterPortalGateway: "போர்டல் நுழைவாயிலில் நுழையவும்",
    staffAuthenticator: "பணியாளர் அங்கீகாரம்",
    excellenceInAction: "செயலில் சிறந்தவிளக்கம்",
    worldClassFaculty: "உலகத்தரம் வாய்ந்த பீடம் மற்றும் ஆராய்ச்சி",
    worldClassFacultyDesc: "கல்வி சார் கடின உழைப்பு மற்றும் புதுமையான ஆராய்ச்சிக்கான எங்களது அர்ப்பணிப்பு, உலகளாவிய தாக்கத்தை ஏற்படுத்தி மாணவர்களை எதிர்காலத்திற்கு தயார்படுத்துகிறது.",
    globalResearch: "உலகளாவிய ஆராய்ச்சி",
    globalResearchDesc: "நிலையான வளர்ச்சி மற்றும் செயற்கை நுண்ணறிவு நெறிமுறைகளில் கவனம் செலுத்தும் 40 க்கும் மேற்பட்ட சர்வதேச ஆராய்ச்சி மையங்கள்.",
    industryLeadership: "தொழில்துறை தலைமை",
    industryLeadershipDesc: "பயிற்சி மற்றும் நிர்வாக வழிகாட்டுதலுக்காக ஃபார்டியூன் 500 நிறுவனங்களுடன் நேரடி கூட்டாண்மை.",
    studentSuccess: "மாணவர் வெற்றி",
    studentSuccessDesc: "6 மாதங்களுக்குள் பட்டதாரிகளுக்கு 98% வேலைவாய்ப்பு வீதத்தை வழங்கும் பிரத்யேக தொழில் மையம்.",
    professionalAdministration: "தொழில்முறை பணியாளர் நிர்வாகம்",
    professionalAdministrationDesc: "திறன் மற்றும் வெளிப்படைத்தன்மைக்காக வடிவமைக்கப்பட்ட பிரத்யேக விடுமுறை மேலாண்மை, துறைசார் தரவுகள் மற்றும் நிர்வாக ஒருங்கிணைப்புக் கருவிகளைப் பயன்படுத்துங்கள்.",
    newAccount: "புதிய கணக்கு",
    enrollmentSetup: "பதிவு போர்டல் அமைப்பு:",
    createStaffProfile: "பணியாளர் சுயவிவரத்தை உருவாக்கு",
    createHodProfile: "HOD சுயவிவரத்தை உருவாக்கு",
    createCeoProfile: "CEO சுயவிவரத்தை உருவாக்கு",
    createAdminProfile: "நிர்வாகி சுயவிவரத்தை உருவாக்கு",
    copyright: "© 2026 யாழ்ப்பாணப் பல்கலைக்கழகம் இலங்கை. பாதுகாப்பான பணியாளர் அடைவு போர்டல். அனைத்து நடவடிக்கைகளும் பாதுகாப்பு இணக்கத்திற்காக தணிக்கை செய்யப்படுகின்றன.",
    privacy: "தனியுரிமை",
    security: "பாதுகாப்பு",
    standards: "தரநிலைகள்",
    loadingSecure: "யாழ்ப்பாணப் பல்கலைக்கழகம்",
    secureGateway: "பாதுகாப்பான நுழைவாயில்",
    
    // Auth Modal
    staffAuthentication: "பணியாளர் அங்கீகாரம்",
    universityEnrollment: "பல்கலைக்கழக சேர்க்கை",
    accessSecureSystem: "பாதுகாப்பான விடுமுறை மேலாண்மை அமைப்பை அணுகவும்.",
    fullLegalName: "முழு சட்டப்பூர்வ பெயர்",
    accessTier: "அணுகல் நிலை",
    staffMember: "பணியாளர் உறுப்பினர்",
    hodRole: "HOD (துறைத் தலைவர்)",
    ceoRole: "CEO",
    adminRole: "நிர்வாகி",
    faculty: "பீடம்",
    internalEmail: "உள் மின்னஞ்சல்",
    securityCredentials: "பாதுகாப்பு சான்றுகள்",
    secureLogin: "பாதுகாப்பான உள்நுழைவு",
    createProfile: "சுயவிவரத்தை உருவாக்கு",
    dontHaveCredentials: "சான்றுகள் இல்லையா?",
    alreadyVerified: "ஏற்கனவே சரிபார்க்கப்பட்டதா?",
    returnToLogin: "உள்நுழைவுக்குத் திரும்பு",

    // Portal Common / Sidebar
    staffConsole: "பணியாளர் கன்சோல்",
    dashboard: "டாஷ்போர்டு",
    applyForLeave: "விடுமுறைக்கு விண்ணப்பிக்கவும்",
    staffApprovals: "பணியாளர் ஒப்புதல்கள்",
    ceoApprovals: "CEO HOD ஒப்புதல்கள்",
    leaveReports: "விடுமுறை அறிக்கைகள்",
    allLeaveRecords: "அனைத்து விடுமுறை பதிவுகள்",
    myLeaveHistory: "எனது விடுமுறை வரலாறு",
    staffDirectory: "பணியாளர் அடைவு",
    signOut: "வெளியேறு",
    accessTierLabel: "அணுகல் நிலை:",
    facultyLabel: "பீடம்/துறை:",
    remainingDays: "மீதமுள்ள விடுமுறை நாட்கள்",

    // Portal Dashboard
    welcomeBack: "மீண்டும் வருக",
    facultyPortalVerified: "பீட போர்டல் சரிபார்க்கப்பட்டது. பாதுகாப்பு நெறிமுறைகள் செயலில் உள்ளன.",
    academicLeaveStatistics: "கல்வி விடுமுறை புள்ளிவிவரங்கள்",
    totalLeaveAllowance: "மொத்த விடுமுறை கொடுப்பனவு",
    usedLeavesApproved: "பயன்படுத்திய விடுமுறைகள் (ஒப்புதல் பெற்றவை)",
    pendingLeavesEvaluation: "மதிப்பீட்டில் உள்ளவை (Pending)",
    remainingLeavesUnused: "மீதமுள்ள விடுமுறைகள் (பயன்படுத்தப்படாதவை)",
    quickLeaveOverview: "விரைவான விடுமுறை கண்ணோட்டம்",
    noLeavesFound: "பல்கலைக்கழகத்தில் இன்னும் விடுமுறைப் பதிவுகள் எதுவும் பதிவு செய்யப்படவில்லை.",
    requestLeaveFormTitle: "கல்விப் பணியிலிருந்து தற்காலிகமாக விலக வேண்டுமா?",
    requestLeaveFormDesc: "நாட்கள் மற்றும் நியமிக்கப்பட்ட பதில் பணியாளரைக் குறிப்பிட்டு மறைகுறியாக்கப்பட்ட விடுமுறை விண்ணப்பத்தைச் சமர்ப்பிக்கவும்.",
    officialStaffProfile: "அதிகாரப்பூர்வ பணியாளர் சுயவிவரம்",
    profileVerifiedInstitutional: "சரிபார்க்கப்பட்ட நிறுவன தரவு. மாற்றம் கணினி நிர்வாகிகளுக்கு மட்டுமே மட்டுப்படுத்தப்பட்டுள்ளது.",
    myRecentLeaves: "எனது சமீபத்திய விடுமுறைகள்",
    approvedDays: "மொத்த அங்கீகரிக்கப்பட்ட நாட்கள்",
    days: "நாட்கள்",
    pending: "காத்திருக்கிறது",
    approved: "அங்கீகரிக்கப்பட்டது",
    rejected: "நிராகரிக்கப்பட்டது",

    // Portal Reports
    reportConfigurations: "அறிக்கை அமைப்புகள்",
    reportConfigsDesc: "துறைகள், பணியாளர் முனைகள் மற்றும் காலவரையறைகளை தனிமைப்படுத்த அளவுருக்களைக் குறிப்பிடவும்.",
    printPdfReport: "அச்சு / PDF அறிக்கை",
    reportTimeframe: "அறிக்கை கால அளவு",
    reportDept: "துறை",
    reportEmployee: "பணியாளர் முனை",
    reportLeaveType: "விடுமுறை வகை",
    totalApprovedDays: "மொத்த அங்கீகரிக்கப்பட்ட நாட்கள்",
    approvalRate: "ஒப்புதல் விகிதம்",
    inEvaluationPipeline: "மதிப்பீட்டு வரிசையில் உள்ளவை",
    totalTransactions: "மொத்த பரிவர்த்தனைகள்",
    distributionCategory: "விடுமுறை வகையின்படி விநியோகம்",
    institutionalInsights: "நிறுவன நுண்ணறிவு சுருக்கம்",
    institutionalInsightsDesc: "இந்த காட்சி அறிக்கை உங்கள் பீடத் துறைக்குள் செயலில் உள்ள விடுமுறை தரவுத்தொகுப்புகளை ஒருங்கிணைக்கிறது. கல்விப் பணியாளர்களின் வளக் கிடைக்கும் தன்மை தொடர்ந்து கல்வி மற்றும் நிர்வாக அட்டவணைகளுக்கு எதிராக கண்காணிக்கப்படுகிறது.",
    leaveRecordsLedger: "விடுமுறை பதிவேடு அட்டவணை",
    records: "பதிவுகள்",
    employeeName: "பணியாளர் பெயர்",
    actingPerson: "பதில் பணியாளர்",
    startDate: "ஆரம்ப தேதி",
    endDate: "முடிவு தேதி",
    status: "நிலை",
    noTransactionRecords: "இந்த இடைவெளியில் பரிவர்த்தனை பதிவுகள் எதுவும் இல்லை.",
    noTransactionDesc: "வரலாற்று தரவு பதிவுகளை ஏற்ற வடிப்பான்களை தளர்த்தவும்.",

    // Portal Approvals
    evalQueue: "உங்கள் மதிப்பீட்டிற்காக காத்திருக்கும் விடுமுறை கோரிக்கைகள்",
    evalQueueDescHOD: "நிலையான ஊழியர்களின் கோரிக்கைகள். பதில் பணியாளரின் நேரடி காலெண்டர்களைக் காட்டுகிறது.",
    evalQueueDescCEO: "HOD கோரிக்கைகள். இறுதி நிர்வாக மதிப்பாய்வு.",
    doubleBooked: "இருமுறை முன்பதிவு செய்யப்பட்டது!",
    onApprovedLeave: "அங்கீகரிக்கப்பட்ட விடுப்பில் உள்ளார்",
    actionRequired: "நடவடிக்கை தேவை: பதில் பணியாளர் முரண்பாடு கண்டறியப்பட்டது",
    noPendingRequests: "உங்கள் கவனத்திற்கு நிலுவையில் உள்ள கோரிக்கைகள் எதுவும் இல்லை.",
    approve: "ஒப்புதல் அளி",
    reject: "நிராகரி",
    comments: "மதிப்பீட்டு கருத்துக்கள்",
    decisionHeader: "மதிப்பீட்டு முடிவை உறுதிப்படுத்தவும்",
    saveDecision: "முடிவைச் சேமி",
    cancel: "ரத்து செய்",

    // Portal Staff Directory (Admin)
    staffDirectoryTitle: "பல்கலைக்கழக பணியாளர் அடைவு",
    staffDirectoryDesc: "மத்திய அடைவு தரவுத்தளத்திலிருந்து அணுகல் நிலைகள், துறை பீடம் ஆகியவற்றைத் திருத்தவும் அல்லது சுயவிவரங்களை நீக்கவும்.",
    searchDirectory: "பெயர், மின்னஞ்சல் அல்லது ஐடி மூலம் தேடவும்...",
    creationDate: "உருவாக்கப்பட்ட தேதி",
    actions: "நடவடிக்கைகள்",
    modifyFacultyProfile: "பீட சுயவிவரத்தை மாற்றவும்",
    confirmEditAction: "திருத்தும் நடவடிக்கையை உறுதிப்படுத்தவும்",
    saveProfiles: "சுயவிவரத்தைச் சேமி",
    confirmDeletion: "நீக்குதலை உறுதிப்படுத்தவும்",
    deleteBtn: "சுயவிவரத்தை நீக்கு",

    // Leave Form
    newLeaveRequest: "புதிய விடுமுறை கோரிக்கை",
    fillLeaveForm: "நாட்களை நிரப்பவும் மற்றும் வளாகத்தில் பதில் பணியாளரை நியமிக்கவும்.",
    leaveType: "விடுமுறை வகை",
    startDateLabel: "ஆரம்ப தேதி",
    endDateLabel: "முடிவு தேதி",
    actingPersonnelID: "பதில் பணியாளர் (ஊழியர் ஐடி)",
    leaveReason: "விடுப்புக்கான காரணம்",
    submitting: "சமர்ப்பிக்கப்படுகிறது...",
    submitRequest: "கோரிக்கையை சமர்ப்பிக்கவும்",
    requestLogged: "கோரிக்கை பதிவு செய்யப்பட்டது",
    requestLoggedDesc: "நாட்காட்டி சோதனைகளுக்காக உங்கள் விடுமுறை கோரிக்கை அங்கீகரிக்கப்பட்ட தலைவர்களுக்கு சமர்ப்பிக்கப்பட்டுள்ளது."
  },
  si: {
    title: "යාපනය විශ්වවිද්‍යාලය ශ්‍රී ලංකාව",
    subtitle: "දැනුම සවිබල ගන්වමින්, අනාගතය හැඩගැස්වීම",
    staffPortal: "සේවක ද්වාරය",
    applyNow: "දැන් අයදුම් කරන්න",
    leaveSystem: "නිවාඩු කළමනාකරණ පද්ධතිය",
    jaffnaUniversity: "යාපනය විශ්වවිද්‍යාලය",
    login: "ඇතුල් වන්න",
    requestAccess: "ප්‍රවේශය ඉල්ලන්න",
    academicExcellence: "විශිෂ්ට ශාස්ත්‍රීය දැනුම සහ නායකත්වය",
    enterPortalGateway: "ද්වාරයට ඇතුළු වන්න",
    staffAuthenticator: "කාර්ය මණ්ඩල සත්‍යාපකය",
    excellenceInAction: "ක්‍රියාවෙන් පෙන්වන විශිෂ්ටත්වය",
    worldClassFaculty: "ලෝක මට්ටමේ පීඨය සහ පර්යේෂණ",
    worldClassFacultyDesc: "ශාස්ත්‍රීය ගුණාත්මකභාවය සහ නව්‍ය පර්යේෂණ සඳහා අපගේ කැපවීම ගෝලීය බලපෑමක් ඇති කරන අතර ශීඝ්‍රයෙන් වෙනස් වන අනාගතයකට සිසුන් සූදානම් කරයි.",
    globalResearch: "ගෝලීය පර්යේෂණ",
    globalResearchDesc: "තිරසාර සංවර්ධනය සහ කෘතිම බුද්ධි ආචාර ධර්ම පිළිබඳ අවධානය යොමු කරන ජාත්‍යන්තර පර්යේෂණ මධ්‍යස්ථාන 40 කට වඩා වැඩි ප්‍රමාණයක්.",
    industryLeadership: "කර්මාන්ත නායකත්වය",
    industryLeadershipDesc: "පුහුණුවීම් සහ විධායක උපදේශනය සඳහා Fortune 500 සමාගම් සමඟ සෘජු හවුල්කාරිත්වය.",
    studentSuccess: "ශිෂ්‍ය සාර්ථකත්වය",
    studentSuccessDesc: "මාස 6ක් ඇතුළත උපාධිධාරීන් සඳහා 98% ක රැකියා නියුක්ති අනුපාතයක් ලබා දෙන වෘත්තීය මධ්‍යස්ථානය.",
    professionalAdministration: "වෘත්තීය කාර්ය මණ්ඩල පරිපාලනය",
    professionalAdministrationDesc: "කාර්යක්ෂමතාවය සහ විනිවිදභාවය සඳහා නිර්මාණය කර ඇති විශේෂිත නිවාඩු කළමනාකරණය, දෙපාර්තමේන්තු දත්ත සහ පරිපාලන සම්බන්ධීකරණ මෙවලම් භාවිතා කරන්න.",
    newAccount: "නව ගිණුමක්",
    enrollmentSetup: "ලියාපදිංචි ද්වාර සැකසුම:",
    createStaffProfile: "කාර්ය මණ්ඩල පැතිකඩක් සාදන්න",
    createHodProfile: "HOD පැතිකඩක් සාදන්න",
    createCeoProfile: "CEO පැතිකඩක් සාදන්න",
    createAdminProfile: "පරිපාලක පැතිකඩක් සාදන්න",
    copyright: "© 2026 යාපනය විශ්වවිද්‍යාලය ශ්‍රී ලංකාව. ආරක්ෂිත කාර්ය මණ්ඩල නාමාවලි ද්වාරය. ආරක්ෂක අනුකූලතාවය සඳහා සියලුම ක්‍රියා විගණනය කරනු ලැබේ.",
    privacy: "පෞද්ගලිකත්වය",
    security: "ආරක්ෂාව",
    standards: "ප්‍රමිති",
    loadingSecure: "යාපනය විශ්වවිද්‍යාලය",
    secureGateway: "ආරක්ෂිත ද්වාරය",
    
    // Auth Modal
    staffAuthentication: "කාර්ය මණ්ඩල සත්‍යාපනය",
    universityEnrollment: "විශ්වවිද්‍යාල ලියාපදිංචිය",
    accessSecureSystem: "ආරක්ෂිත නිවාඩු කළමනාකරණ පද්ධතියට පිවිසෙන්න.",
    fullLegalName: "සම්පූර්ණ නීත්‍යානුකූල නම",
    accessTier: "ප්‍රවේශ මට්ටම",
    staffMember: "කාර්ය මණ්ඩල සාමාජිකයා",
    hodRole: "HOD (දෙපාර්තමේන්තු ප්‍රධානියා)",
    ceoRole: "CEO",
    adminRole: "පරිපාලක",
    faculty: "පීඨය",
    internalEmail: "අභ්‍යන්තර විද්‍යුත් තැපෑල",
    securityCredentials: "ආරක්ෂක අක්තපත්‍ර",
    secureLogin: "ආරක්ෂිතව ඇතුළු වන්න",
    createProfile: "පැතිකඩ සාදන්න",
    dontHaveCredentials: "අක්තපත්‍ර නොමැතිද?",
    alreadyVerified: "දැනටමත් සත්‍යාපනය කර තිබේද?",
    returnToLogin: "නැවත ඇතුළු වීමේ පිටුවට",

    // Portal Common / Sidebar
    staffConsole: "කාර්ය මණ්ඩල පාලක පුවරුව",
    dashboard: "පාලන පුවරුව",
    applyForLeave: "නිවාඩු සඳහා අයදුම් කරන්න",
    staffApprovals: "කාර්ය මණ්ඩල අනුමැතීන්",
    ceoApprovals: "CEO HOD අනුමැතීන්",
    leaveReports: "නිවාඩු වාර්තා",
    allLeaveRecords: "සියලුම නිවාඩු වාර්තා",
    myLeaveHistory: "මගේ නිවාඩු ඉතිහාසය",
    staffDirectory: "කාර්ය මණ්ඩල නාමාවලිය",
    signOut: "නික්ම යන්න",
    accessTierLabel: "ප්‍රවේශ මට්ටම:",
    facultyLabel: "පීඨය/දෙපාර්තමේන්තුව:",
    remainingDays: "ඉතිරිව ඇති නිවාඩු දින",

    // Portal Dashboard
    welcomeBack: "සාදරයෙන් පිළිගනිමු",
    facultyPortalVerified: "පීඨ ද්වාරය සත්‍යාපනය කරන ලදී. ආරක්ෂක ප්‍රොටෝකෝල ක්‍රියාත්මකයි.",
    academicLeaveStatistics: "ශාස්ත්‍රීය නිවාඩු සංඛ්‍යාලේඛන",
    totalLeaveAllowance: "මුළු නිවාඩු දීමනාව",
    usedLeavesApproved: "භාවිතා කළ නිවාඩු (අනුමත)",
    pendingLeavesEvaluation: "ඇගයීමේ පවතින (Pending)",
    remainingLeavesUnused: "ඉතිරි නිවාඩු (භාවිතා නොකළ)",
    quickLeaveOverview: "කෙටි නිවාඩු දළ විශ්ලේෂණය",
    noLeavesFound: "විශ්වවිද්‍යාලය තුළ තවමත් නිවාඩු වාර්තා කිසිවක් ලොග් වී නොමැත.",
    requestLeaveFormTitle: "ශාස්ත්‍රීය රාජකාරිවලින් තාවකාලිකව බැහැර විය යුතුද?",
    requestLeaveFormDesc: "දින සහ නියමිත වැඩ බලන සේවකයා සඳහන් කරමින් සංකේතනය කළ නිවාඩු අයදුම්පතක් ඉදිරිපත් කරන්න.",
    officialStaffProfile: "නිල කාර්ය මණ්ඩල පැතිකඩ",
    profileVerifiedInstitutional: "සත්‍යාපිත ආයතනික දත්ත. වෙනස් කිරීම පද්ධති පරිපාලකයින්ට පමණක් සීමා වේ.",
    myRecentLeaves: "මගේ මෑතකාලීන නිවාඩු",
    approvedDays: "මුළු අනුමත දින ගණන",
    days: "දින",
    pending: "පොරොත්තුවෙන්",
    approved: "අනුමතයි",
    rejected: "ප්‍රතික්ෂේපිතයි",

    // Portal Reports
    reportConfigurations: "වාර්තා වින්‍යාසයන්",
    reportConfigsDesc: "දෙපාර්තමේන්තු, සේවක නෝඩ් සහ කාල රාමු වෙන්කර හඳුනා ගැනීමට පරාමිතීන් සඳහන් කරන්න.",
    printPdfReport: "මුද්‍රණය / PDF වාර්තාව",
    reportTimeframe: "වාර්තා කාල සීමාව",
    reportDept: "දෙපාර්තමේන්තුව",
    reportEmployee: "සේවක නෝඩය",
    reportLeaveType: "නිවාඩු වර්ගය",
    totalApprovedDays: "මුළු අනුමත දින ගණන",
    approvalRate: "අනුමැති අනුපාතය",
    inEvaluationPipeline: "ඇගයීම් නල මාර්ගයේ පවතී",
    totalTransactions: "මුළු ගනුදෙනු ගණන",
    distributionCategory: "නිවාඩු කාණ්ඩය අනුව බෙදා හැරීම",
    institutionalInsights: "ආයතනික තක්සේරු සාරාංශය",
    institutionalInsightsDesc: "මෙම දෘශ්‍ය වාර්තාව ඔබේ පීඨ දෙපාර්තමේන්තුව තුළ ක්‍රියාකාරී නිවාඩු දත්ත කට්ටල ඒකාබද්ධ කරයි. ශාස්ත්‍රීය පුද්ගල සම්පත් පවතින බව අඛණ්ඩ ශාස්ත්‍රීය හා පරිපාලන කාලසටහන්වලට සාපේක්ෂව ගතිකව නිරීක්ෂණය කෙරේ.",
    leaveRecordsLedger: "නිවාඩු වාර්තා ලේඛන වගුව",
    records: "වාර්තා",
    employeeName: "සේවකයාගේ නම",
    actingPerson: "වැඩ බලන පුද්ගලයා",
    startDate: "ආරම්භක දිනය",
    endDate: "අවසන් දිනය",
    status: "තත්ත්වය",
    noTransactionRecords: "මෙම කාල පරාසය තුළ කිසිදු ගනුදෙනු වාර්තාවක් නොමැත.",
    noTransactionDesc: "ඓතිහාසික දත්ත වාර්තා පූරණය කිරීමට පෙරහන් ලිහිල් කරන්න.",

    // Portal Approvals
    evalQueue: "ඔබගේ ඇගයීම අපේක්ෂාවෙන් පවතින නිවාඩු ඉල්ලීම්",
    evalQueueDescHOD: "සාමාන්‍ය සේවකයින්ගේ ඉල්ලීම්. වැඩ බලන පුද්ගලයාගේ තත්කාලීන දින දර්ශන පෙන්වයි.",
    evalQueueDescCEO: "HOD ඉල්ලීම්. විධායක අවසාන සමාලෝචනය.",
    doubleBooked: "දැනටමත් වෙන්කර ඇත!",
    onApprovedLeave: "අනුමත නිවාඩු මත සිටී",
    actionRequired: "ක්‍රියාමාර්ගයක් අවශ්‍යයි: වැඩ බලන සේවක ගැටුමක් හඳුනාගෙන ඇත",
    noPendingRequests: "ඔබේ අවධානය යොමු විය යුතු පොරොත්තුවෙන් පවතින ඉල්ලීම් කිසිවක් නැත.",
    approve: "අනුමත කරන්න",
    reject: "ප්‍රතික්ෂේප කරන්න",
    comments: "ඇගයීම් අදහස්",
    decisionHeader: "ඇගයීම් තීරණය තහවුරු කරන්න",
    saveDecision: "තීරණය සුරකින්න",
    cancel: "අවලංගු කරන්න",

    // Portal Staff Directory (Admin)
    staffDirectoryTitle: "විශ්වවිද්‍යාල කාර්ය මණ්ඩල නාමාවලිය",
    staffDirectoryDesc: "මධ්‍යම නාමාවලි දත්ත ගබඩාවෙන් ප්‍රවේශ මට්ටම්, දෙපාර්තමේන්තු පීඨ සංස්කරණය කරන්න හෝ පැතිකඩ මකා දමන්න.",
    searchDirectory: "නම, විද්‍යුත් තැපෑල හෝ හැඳුනුම්පත මගින් සොයන්න...",
    creationDate: "නිර්මාණය කළ දිනය",
    actions: "ක්‍රියාවන්",
    modifyFacultyProfile: "පීඨ පැතිකඩ වෙනස් කරන්න",
    confirmEditAction: "සංස්කරණ ක්‍රියාව තහවුරු කරන්න",
    saveProfiles: "පැතිකඩ සුරකින්න",
    confirmDeletion: "මකා දැමීම තහවුරු කරන්න",
    deleteBtn: "පැතිකඩ මකන්න",

    // Leave Form
    newLeaveRequest: "නව නිවාඩු ඉල්ලීමක්",
    fillLeaveForm: "දින පුරවා කැම්පස් එකේ වැඩ බලන සේවකයා නම් කරන්න.",
    leaveType: "නිවාඩු වර්ගය",
    startDateLabel: "ආරම්භක දිනය",
    endDateLabel: "අවසන් දිනය",
    actingPersonnelID: "වැඩ බලන සේවකයා (සේවක හැඳුනුම්පත)",
    leaveReason: "නිවාඩු ලබා ගැනීමට හේතුව",
    submitting: "ඉදිරිපත් කරමින්...",
    submitRequest: "ඉල්ලීම ඉදිරිපත් කරන්න",
    requestLogged: "ඉල්ලීම ලොග් කරන ලදී",
    requestLoggedDesc: "දින දර්ශන පරීක්ෂා කිරීම සඳහා ඔබේ නිවාඩු ඉල්ලීම බලයලත් ප්‍රධානීන්ට ඉදිරිපත් කර ඇත."
  }
};

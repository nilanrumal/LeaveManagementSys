import React, { useState } from 'react';
import { 
  BookOpen, 
  Settings, 
  GitBranch, 
  Layers, 
  Users, 
  Database, 
  CheckCircle, 
  ShieldCheck, 
  Cpu, 
  Printer, 
  ArrowRight, 
  FileText,
  Activity,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';

export default function SubmissionHub() {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'requirements' | 'architecture' | 'usecases'>('overview');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:p-0 print:bg-white print:shadow-none">
      {/* Printable Header */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden print:bg-none print:text-black print:p-4 print:border-b print:border-slate-300 print:rounded-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-mono tracking-wider font-black uppercase">Jaffna University Submission</span>
            <span className="px-3 py-1 bg-emerald-500 rounded-full text-[10px] font-mono tracking-wider font-black uppercase">Academic Documentation</span>
          </div>
          <h2 className="text-2xl font-sans font-black tracking-tight print:text-black">University Submission &amp; Documentation Hub</h2>
          <p className="text-white/80 text-xs max-w-2xl font-medium print:text-slate-600">
            This module contains verified academic systems documentation, system design specifications, functional requirements, and visual architectural schema designed for departmental presentation.
          </p>
        </div>
        <button 
          onClick={handlePrint}
          className="bg-white text-orange-600 hover:bg-orange-50 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition active:scale-95 cursor-pointer text-xs shrink-0 print:hidden"
        >
          <Printer size={15} /> Print Full Report
        </button>
      </div>

      {/* Navigation tabs - hidden on print */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl print:hidden">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'overview' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <BookOpen size={14} /> Overview &amp; SDLC
        </button>
        <button
          onClick={() => setActiveSubTab('requirements')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'requirements' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <FileText size={14} /> Requirements (FR/NFR)
        </button>
        <button
          onClick={() => setActiveSubTab('architecture')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'architecture' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Layers size={14} /> System Architecture
        </button>
        <button
          onClick={() => setActiveSubTab('usecases')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'usecases' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Users size={14} /> Actors &amp; Use Cases
        </button>

      </div>

      {/* Main Report Body */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm print:border-none print:shadow-none print:p-0">
        
        {/* SECTION 1: OVERVIEW & SDLC */}
        {(activeSubTab === 'overview' || window.matchMedia('print').matches) && (
          <div className="space-y-8 print:block">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="text-orange-500" size={18} />
                <h3 className="font-sans font-black text-sm uppercase tracking-wider text-slate-800">1. Literature &amp; SDLC Methodology</h3>
              </div>
              <p className="text-xs text-slate-400">Contextual positioning, state-of-the-art analysis, and the Software Development Life Cycle.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Existing systems */}
              <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Activity size={13} className="text-orange-500" /> Existing Systems &amp; Technologies
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Several commercial and open-source leave management solutions exist, including <strong>OrangeHRM</strong>, <strong>GreytHR</strong>, and <strong>Zoho People</strong>. However, these enterprise systems are often feature-heavy, require complex system integrations, and pose high licensing costs that are prohibitive for small academic departments.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  In Sri Lanka and similar developing educational contexts, universities rely on customized hierarchies and policy structures (e.g., matching a <strong>Staff &rarr; Head of Department (HOD) &rarr; Dean/CEO</strong> chain). This system has been specifically built from the ground up to support the precise rules, acting personnel calendars, and secure verification procedures of <strong>Jaffna University</strong>, providing a lightweight, zero-license, and high-performance alternative.
                </p>
              </div>

              {/* SDLC */}
              <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <GitBranch size={13} className="text-orange-500" /> SDLC Methodology (Waterfall)
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The <strong>Software Development Life Cycle (SDLC)</strong> is a structured process for planning, creating, testing, and deploying software. For this departmental system, a linear/sequential <strong>Waterfall Model</strong> was adopted. This model is exceptionally well-suited for projects with clearly defined requirements and small development teams.
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                  <div className="p-2 bg-white rounded-lg border border-slate-100 font-medium">
                    <span className="font-bold text-slate-700">1. Requirement Analysis:</span> Extracting Jaffna University academic leave rules, allowances, and HOD/CEO roles.
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-100 font-medium">
                    <span className="font-bold text-slate-700">2. System Design:</span> Formulating clean role-based dashboards and a secure relational Firestore entity layout.
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-100 font-medium">
                    <span className="font-bold text-slate-700">3. Implementation:</span> Developing frontend reactive layers with React, Tailwind CSS, and Firestore backend.
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-100 font-medium">
                    <span className="font-bold text-slate-700">4. Verification &amp; Testing:</span> Exhaustive validation checks on leave dates, balances, and acting personnel overlap.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: REQUIREMENTS */}
        {(activeSubTab === 'requirements' || window.matchMedia('print').matches) && (
          <div className="space-y-8 print:block mt-8 print:mt-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="text-orange-500" size={18} />
                <h3 className="font-sans font-black text-sm uppercase tracking-wider text-slate-800">2. System Requirements</h3>
              </div>
              <p className="text-xs text-slate-400">Specifying functional capabilities (FR) and non-functional quality metrics (NFR) of the system.</p>
            </div>

            {/* Functional requirements */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Functional Requirements (FR)</h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3 w-16">ID</th>
                      <th className="p-3 w-40">Module</th>
                      <th className="p-3">Requirement Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="p-3 font-mono font-bold text-orange-600">FR01</td>
                      <td className="p-3 font-bold">User Management</td>
                      <td className="p-3">Secure, authenticated login with distinct access tiers and specific dashboard configurations for HOD, Staff, and CEO.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-orange-600">FR02</td>
                      <td className="p-3 font-bold">Leave Application</td>
                      <td className="p-3">Academic staff can apply for leave by specifying dates, leave type, justification, and selecting an active on-campus acting staff node.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-orange-600">FR03</td>
                      <td className="p-3 font-bold">Leave Validation</td>
                      <td className="p-3">Real-time verification ensuring leaves are applied at least 1 day in advance and the applicant maintains a sufficient leave balance.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-orange-600">FR04</td>
                      <td className="p-3 font-bold">Approval Workflow</td>
                      <td className="p-3">Automatic routing of applications: Standard Staff requests go to their department HOD; HOD requests go to the CEO for final authorization.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-orange-600">FR05</td>
                      <td className="p-3 font-bold">Approve / Reject</td>
                      <td className="p-3">Approving authorities (HOD/CEO) can evaluate requests, detect acting personnel conflict states, and save decisions with commentary.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-orange-600">FR06</td>
                      <td className="p-3 font-bold">Leave Balance</td>
                      <td className="p-3">System automatically decrements approved days from the employee's total allowance (Casual: 10, Medical: 15) in real-time.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-orange-600">FR07</td>
                      <td className="p-3 font-bold">Leave History</td>
                      <td className="p-3">Employees can track and review complete leave records (Pending, Approved, Rejected) and generate a secure PDF statement.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-orange-600">FR08</td>
                      <td className="p-3 font-bold">Reporting</td>
                      <td className="p-3">HODs and CEOs can filter department leaves by category or staff node and generate an instant PDF ledger report.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-orange-600">FR09</td>
                      <td className="p-3 font-bold">Notifications</td>
                      <td className="p-3">Real-time portal update indicators and a built-in interactive simulator for dispatching instant status updates to WhatsApp.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-orange-600">FR10</td>
                      <td className="p-3 font-bold">Data Security</td>
                      <td className="p-3">Sensitive identifiers are encrypted; all database queries use secure SDK connections and structured security rules to block injection.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Non-functional requirements */}
            <div className="space-y-4 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Non-Functional Requirements (NFR)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Usability', desc: 'The portal uses responsive layout, bilingual translations, and intuitive form interfaces to allow usage by non-technical campus personnel.' },
                  { title: 'Security', desc: 'Authentication handles secure hashing of credentials via Firebase Auth. Granular database queries are secured via strict Firestore Rules.' },
                  { title: 'Performance', desc: 'All state synchronizations and page transitions complete inside 1.5 seconds. Large PDFs compile client-side in under 1 second.' },
                  { title: 'Reliability', desc: 'The cloud-native Firestore integration guarantees continuous real-time state synchronization, avoiding loss during network interrupts.' },
                  { title: 'Scalability', desc: 'The code is completely modular. Splitting types, database service scripts, and visual components allows adding other faculties seamlessly.' },
                  { title: 'Compatibility', desc: 'Flawless execution on all modern, standard web browsers (Chrome, Safari, Firefox, Edge) without requiring special helper plugins.' },
                ].map((nfr, i) => (
                  <div key={i} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                    <h5 className="text-xs font-bold text-slate-800 mb-1">{nfr.title}</h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{nfr.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: SYSTEM ARCHITECTURE */}
        {(activeSubTab === 'architecture' || window.matchMedia('print').matches) && (
          <div className="space-y-8 print:block mt-8 print:mt-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Layers className="text-orange-500" size={18} />
                <h3 className="font-sans font-black text-sm uppercase tracking-wider text-slate-800">3. System Architecture</h3>
              </div>
              <p className="text-xs text-slate-400">High-performance three-tier stack tailored for Jaffna University.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
              <div className="p-6 bg-orange-50/20 border border-orange-100 rounded-2xl relative">
                <div className="absolute top-4 right-4 text-orange-500 font-mono text-[10px] font-bold">TIER 1</div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
                  <Cpu size={14} className="text-orange-500" /> Presentation Layer
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Developed as a fast, single-page application using <strong>React 19</strong>, <strong>TypeScript</strong>, and <strong>Vite</strong>. Styled utilizing modern <strong>Tailwind CSS v4</strong> and highly interactive animations powered by <strong>Motion</strong>. Direct interface rendered to on-campus browsers.
                </p>
              </div>

              <div className="p-6 bg-orange-50/20 border border-orange-100 rounded-2xl relative">
                <div className="absolute top-4 right-4 text-orange-500 font-mono text-[10px] font-bold">TIER 2</div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
                  <Settings size={14} className="text-orange-500" /> Application Logic Layer
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Decoupled server-less transactions interacting directly with secure cloud service endpoints. Handles roles-based checks, live leave validations, acting personnel conflict detection, and formats PDF layouts instantly using lightweight vector drawing mechanisms.
                </p>
              </div>

              <div className="p-6 bg-orange-50/20 border border-orange-100 rounded-2xl relative">
                <div className="absolute top-4 right-4 text-orange-500 font-mono text-[10px] font-bold">TIER 3</div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
                  <Database size={14} className="text-orange-500" /> Data Storage Layer
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Centralized cloud persistence utilizing **Google Cloud Firestore NoSQL Database**. Schema access rules are strictly guarded by structural file guidelines (`firestore.rules`) to guarantee end-to-end data sanitization and prevent any form of SQL-injection or unauthorized updates.
                </p>
              </div>
            </div>

            {/* Architecture flow visualization */}
            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Data &amp; Request Flow Specification</h4>
              <div className="flex flex-col md:flex-row items-center justify-around gap-4 text-xs font-mono font-bold text-center">
                <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm w-full md:w-1/4">
                  <div className="text-orange-500 mb-1">User Browser</div>
                  <div className="text-[10px] text-slate-500">Inputs Leave / Review</div>
                </div>
                <div className="text-slate-300 font-black rotate-90 md:rotate-0">&rarr;</div>
                <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm w-full md:w-1/4">
                  <div className="text-orange-500 mb-1">React Controller</div>
                  <div className="text-[10px] text-slate-500">Validates Overlaps &amp; Balances</div>
                </div>
                <div className="text-slate-300 font-black rotate-90 md:rotate-0">&rarr;</div>
                <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm w-full md:w-1/4">
                  <div className="text-orange-500 mb-1">Firestore Cloud DB</div>
                  <div className="text-[10px] text-slate-500">Secure Audit Log Logs</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: ACTORS AND USE CASES */}
        {(activeSubTab === 'usecases' || window.matchMedia('print').matches) && (
          <div className="space-y-8 print:block mt-8 print:mt-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="text-orange-500" size={18} />
                <h3 className="font-sans font-black text-sm uppercase tracking-wider text-slate-800">4. Actors &amp; Use Cases</h3>
              </div>
              <p className="text-xs text-slate-400">Interactive visual map of system actors and their core functional boundaries (matching Jaffna Uni Use Case Diagram).</p>
            </div>

            {/* Visual Use Case Diagram */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-radial-gradient from-orange-500/5 to-transparent pointer-events-none" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                
                {/* Visual nodes */}
                <div className="space-y-4">
                  <div className="border border-slate-800 bg-slate-950/80 rounded-xl p-4">
                    <span className="text-[10px] font-mono text-orange-500 font-bold uppercase tracking-wider">Visual Map</span>
                    <h5 className="text-xs font-bold text-slate-300 mt-1 mb-3">Actors to Use Case Mappings</h5>
                    
                    {/* Simplified diagram rendering */}
                    <div className="space-y-3 font-mono text-[10px]">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-amber-500/10 text-amber-400 rounded border border-amber-500/20 w-32 text-center">Employee / Staff</span>
                        <span className="text-slate-500">&rarr;</span>
                        <span className="text-slate-300">View History, View Balance, Apply Leave, Login</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20 w-32 text-center">HOD</span>
                        <span className="text-slate-500">&rarr;</span>
                        <span className="text-slate-300">Apply Leave, Approve/Reject, Login, Generate Report</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded border border-purple-500/20 w-32 text-center">CEO</span>
                        <span className="text-slate-500">&rarr;</span>
                        <span className="text-slate-300">Approve/Reject HOD Leaves, Login, Generate Report</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 w-32 text-center">Admin</span>
                        <span className="text-slate-500">&rarr;</span>
                        <span className="text-slate-300">Login, Generate Reports, Manage Central Users</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Structured details */}
                <div className="space-y-4 text-xs text-slate-300">
                  <p className="leading-relaxed">
                    This interactive matrix corresponds exactly to the official **Actors &amp; Use Case Diagram**. Each user class maintains precise privileges:
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li><strong className="text-white">Academic Employees (Staff):</strong> Restricted to personal leave request workflows, acting assignment verification, and remaining days statistics.</li>
                    <li><strong className="text-white">Heads of Departments (HOD):</strong> Evaluates staff applications within their specific faculty node, checking for acting availability.</li>
                    <li><strong className="text-white">CEO:</strong> Maintains ultimate veto over HOD-level applications, ensuring faculty continuity and administrative overhead audits.</li>
                    <li><strong className="text-white">System Administrator:</strong> Commands root administrative access, enrolling users, editing profiles, and auditing security transactions.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}



      </div>
    </div>
  );
}

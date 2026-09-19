import React from 'react';
import { User, Stethoscope, ClipboardList, Shield, ArrowRight, CheckCircle2, FileText, Calendar, Bell, BrainCircuit, Activity, Heart, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

interface RoleDetail {
  id: string;
  tabLabel: string;
  badge: string;
  title: string;
  description: string;
  portalPath: string;
  buttonLabel: string;
  highlights: string[];
  metrics: { label: string; value: string }[];
  previewContent: {
    title: string;
    subtitle: string;
    items: { icon: any; title: string; subtitle: string; tag?: string; tagColor?: string }[];
  };
}

const ROLES: RoleDetail[] = [
  {
    id: 'patient',
    tabLabel: 'For Patients',
    badge: 'Patient Centric Care',
    title: 'Instant Scheduling, Lab Reports & AI Triage in Your Pocket',
    description:
      'Empower patients with full visibility into their healthcare journey. Book verified doctor slots in seconds, review diagnostic reports, check prescriptions, and access our 24/7 AI clinical assistant.',
    portalPath: '/dashboard/patient',
    buttonLabel: 'Launch Patient Portal',
    highlights: [
      'One-click specialist appointment booking with real-time slot confirmation',
      'Instant access to lab test panels, imaging reports, and doctor clinical notes',
      'AI triage assistant providing preliminary assessment before you visit',
      'Electronic prescription wallet with medication reminders and dosage guides',
    ],
    metrics: [
      { label: 'Booking Time', value: '< 45s' },
      { label: 'Patient Satisfaction', value: '98.4%' },
      { label: 'Instant Lab Sync', value: '100%' },
    ],
    previewContent: {
      title: 'Active Patient Portal',
      subtitle: 'John Doe • Medical ID: MP-89410',
      items: [
        {
          icon: Calendar,
          title: 'Consultation with Dr. Sarah Jenkins',
          subtitle: 'Today at 2:30 PM • Neurology Clinic Suite 402',
          tag: 'Confirmed',
          tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        },
        {
          icon: FileText,
          title: 'Comprehensive Metabolic Panel (CMP)',
          subtitle: 'All 14 biomarkers within normal reference ranges',
          tag: 'Ready to View',
          tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
        },
        {
          icon: Heart,
          title: 'Prescription: Atorvastatin 20mg',
          subtitle: '1 tablet nightly • 28 days remaining • Refill auto-sent',
          tag: 'Active',
          tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
        },
      ],
    },
  },
  {
    id: 'doctor',
    tabLabel: 'For Doctors & Surgeons',
    badge: 'Clinical Workstation',
    title: 'AI Diagnostic Co-Pilot, Seamless EHR & Patient Longitudinal History',
    description:
      'Designed by physicians for physicians. Minimize administrative screen fatigue with intelligent patient summaries, voice-driven symptom note taking, differential diagnosis support, and instant e-prescriptions.',
    portalPath: '/dashboard/doctor',
    buttonLabel: 'Launch Doctor Portal',
    highlights: [
      'Comprehensive electronic health record (EHR) timeline with historical trend charts',
      'Integrated Gemini AI clinical co-pilot for drug interaction alerts & differential diagnosis',
      'One-click e-prescription generator auto-routed directly to the hospital dispensary',
      'Real-time bed rounding list with vital alert notifications and lab callbacks',
    ],
    metrics: [
      { label: 'Chart Time Saved', value: '38%' },
      { label: 'Diagnostic Accuracy', value: '99.2%' },
      { label: 'Prescription Speed', value: 'Instant' },
    ],
    previewContent: {
      title: 'Dr. Michael Chen, MD - Cardiology',
      subtitle: 'Rounding Schedule • 8 Patients Scheduled Today',
      items: [
        {
          icon: BrainCircuit,
          title: 'AI Clinical Recommendation',
          subtitle: 'Patient #448 shows QTc prolongation; review anti-arrhythmic dosage',
          tag: 'Clinical Alert',
          tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
        },
        {
          icon: Activity,
          title: 'Echocardiogram: LVEF 58%',
          subtitle: 'Normal LV systolic function; trace mitral regurgitation noted',
          tag: 'Signed Off',
          tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        },
        {
          icon: Clock,
          title: 'Next Patient: Robert Taylor (64y)',
          subtitle: 'Post-op CABG follow-up • Vitals: BP 124/78, HR 72',
          tag: 'In Waiting Bay',
          tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
        },
      ],
    },
  },
  {
    id: 'receptionist',
    tabLabel: 'For Front Desk & Triage',
    badge: 'Hospital Operations',
    title: 'Rapid Token Queues, Bed Allocation & Insurance Verification',
    description:
      'Accelerate patient intake and eliminate waiting room congestion. Instantly generate emergency admissions, cross-verify insurance policies, assign hospital beds in real-time, and process co-pays.',
    portalPath: '/dashboard/receptionist',
    buttonLabel: 'Launch Reception Desk',
    highlights: [
      'Interactive visual bed matrix displaying real-time ICU, trauma, and ward availability',
      'Smart patient queue management with automated SMS call-up alerts',
      'Instant policy eligibility checks reducing claim rejections by up to 92%',
      'Emergency fast-track intake bypassing routine paperwork for urgent cases',
    ],
    metrics: [
      { label: 'Intake Wait Time', value: '< 2 mins' },
      { label: 'Bed Allocation', value: 'Real-time' },
      { label: 'Claim Rejection', value: '< 1.8%' },
    ],
    previewContent: {
      title: 'Main Lobby & Triage Desk #02',
      subtitle: 'Active Tokens: 18 • Available Beds: 48/64',
      items: [
        {
          icon: ClipboardList,
          title: 'Token #A-104: Emergency Walk-in',
          subtitle: 'Dispatched to Trauma Bay 3 • Dr. Jenkins assigned',
          tag: 'Triage High',
          tagColor: 'bg-red-50 text-red-700 border-red-200',
        },
        {
          icon: Shield,
          title: 'Blue Cross Shield: Pre-Authorization Confirmed',
          subtitle: 'Member #BC-99214 • Co-pay $25 verified and collected',
          tag: 'Approved',
          tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        },
        {
          icon: Calendar,
          title: 'Scheduled Admissions for Surgery Wing',
          subtitle: 'Ward 4B Bed 12 prepped for 11:00 AM orthopedics case',
          tag: 'Bed Assigned',
          tagColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        },
      ],
    },
  },
  {
    id: 'admin',
    tabLabel: 'For Administrators & C-Suite',
    badge: 'Enterprise Governance',
    title: 'Hospital-Wide Telemetry, Revenue Cycle & Regulatory Compliance',
    description:
      'A single executive command center for chief medical officers and hospital administrators. Monitor occupancy rates, financial performance, doctor credentials, and audit logs with enterprise security.',
    portalPath: '/dashboard/admin',
    buttonLabel: 'Launch Admin Console',
    highlights: [
      'Real-time financial analytics tracking billing cycles, claims, and department revenue',
      'Staff roster balancing and credential expiration monitoring across all wings',
      'Immutable cryptographic audit logs for HIPAA, GDPR, and ISO 27001 regulatory compliance',
      'Multi-site hospital coordination with centralized inventory and resource pooling',
    ],
    metrics: [
      { label: 'Billing Cycle', value: '-40% Time' },
      { label: 'Audit Trail', value: '100% Signed' },
      { label: 'Operational Uptime', value: '99.99%' },
    ],
    previewContent: {
      title: 'MedPulse Executive Command Center',
      subtitle: 'Facility Status: 3 Hospitals • 450 Beds Total',
      items: [
        {
          icon: Activity,
          title: 'Daily Gross Hospital Revenue: $148,250',
          subtitle: 'Pharmacy ($42k) • Inpatient ($74k) • Diagnostic Imaging ($32k)',
          tag: '+12% MoM',
          tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        },
        {
          icon: Shield,
          title: 'HIPAA & ISO 27001 Audit Ledger',
          subtitle: 'All 1,420 transaction logs cryptographically signed and stored',
          tag: 'Compliant',
          tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
        },
        {
          icon: ClipboardList,
          title: 'Staff Credentialing: 100% Up to Date',
          subtitle: '34 doctors, 112 nurses active • Zero clinical license lapses',
          tag: 'Verified',
          tagColor: 'bg-slate-100 text-slate-700 border-slate-200',
        },
      ],
    },
  },
];

export default function RoleExperienceHub() {
  const [activeTab, setActiveTab] = React.useState('patient');
  const role = ROLES.find((r) => r.id === activeTab) || ROLES[0];

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Activity size={14} />
            <span>Unified Healthcare Operating System</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-4">
            Crafted for Every Role in the Hospital Ecosystem.
          </h2>
          <p className="text-base md:text-lg text-slate-600 leading-relaxed">
            Eliminate silos between doctors, patients, nursing staff, and management with purpose-built workflows designed for speed and clarity.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-10 overflow-x-auto pb-2 scrollbar-none">
          <div className="inline-flex items-center gap-1.5 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
            {ROLES.map((r) => {
              const isActive = r.id === activeTab;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActiveTab(r.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {r.tabLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid lg:grid-cols-12 gap-8 items-center bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-200/40"
          >
            {/* Left information column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-block px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                {role.badge}
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
                {role.title}
              </h3>

              <p className="text-slate-600 text-base leading-relaxed">
                {role.description}
              </p>

              {/* Highlights checklist */}
              <div className="space-y-3 pt-2">
                {role.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={13} />
                    </div>
                    <span className="text-sm font-medium text-slate-700 leading-snug">
                      {highlight}
                    </span>
                  </div>
                ))}
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                {role.metrics.map((m, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-lg md:text-xl font-bold font-mono text-slate-900">{m.value}</div>
                    <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Link
                  to={role.portalPath}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all"
                >
                  <span>{role.buttonLabel}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Right Interactive Mockup Column */}
            <div className="lg:col-span-6">
              <div className="bg-slate-950 rounded-3xl p-5 md:p-6 border border-slate-800 shadow-2xl text-white">
                {/* Mockup Window Controls */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                    https://medpulse.hospital{role.portalPath}
                  </div>
                  <span className="w-3 h-3" />
                </div>

                {/* Mockup Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-tight">
                      {role.previewContent.title}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {role.previewContent.subtitle}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-mono font-bold">
                    LIVE VIEW
                  </span>
                </div>

                {/* Mockup List items */}
                <div className="space-y-3">
                  {role.previewContent.items.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-3 hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 border border-slate-700">
                            <Icon size={18} />
                          </div>
                          <div>
                            <div className="text-xs md:text-sm font-bold text-white">
                              {item.title}
                            </div>
                            <div className="text-[11px] md:text-xs text-slate-400 mt-0.5">
                              {item.subtitle}
                            </div>
                          </div>
                        </div>

                        {item.tag && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                              item.tagColor || 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {item.tag}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Bar in Mockup */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Data Encrypted: AES-256 GCM</span>
                  <span className="text-emerald-400">● 100% Synced</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

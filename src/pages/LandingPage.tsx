import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowRight,
  ShieldCheck,
  Activity,
  Users,
  Calendar,
  Stethoscope,
  Mail,
  Phone,
  MapPin,
  Star,
  Quote,
  Heart,
  Zap,
  Shield,
  ChevronRight,
  Menu,
  X,
  BrainCircuit,
  Sparkles,
  Bed,
  FileText,
  Clock,
  CheckCircle2,
  Lock,
  Building2,
  Layers,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import EmergencyTicker from '../components/landing/EmergencyTicker';
import QuickDoctorFinder from '../components/landing/QuickDoctorFinder';
import HospitalTelemetryHud from '../components/landing/HospitalTelemetryHud';
import RoleExperienceHub from '../components/landing/RoleExperienceHub';
import HospitalCapacityRadar from '../components/landing/HospitalCapacityRadar';
import InteractiveAiTriage from '../components/landing/InteractiveAiTriage';
import HeroAiAssistantCard from '../components/landing/HeroAiAssistantCard';
import CostEstimator from '../components/landing/CostEstimator';
import FaqSection from '../components/landing/FaqSection';

function ContactInfoItem({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-11 h-11 bg-blue-50 border border-blue-200/60 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
        <p className="text-slate-600 text-sm mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);

  const portals = [
    { name: 'Patient Portal', path: '/dashboard/patient', role: 'patient', desc: 'Bookings, lab reports & AI triage' },
    { name: 'Doctor Portal', path: '/dashboard/doctor', role: 'doctor', desc: 'Clinical charts & differential diagnosis' },
    { name: 'Reception & Triage', path: '/dashboard/receptionist', role: 'receptionist', desc: 'Fast check-in & bed matrix' },
    { name: 'Admin Console', path: '/dashboard/admin', role: 'admin', desc: 'Telemetry, billing & compliance' },
  ];

  const navLinks = [
    { name: 'Overview', href: '#' },
    { name: 'AI Assistant', href: '#ai-top-assistant' },
    { name: 'Services', href: '#services' },
    { name: 'Portals', href: '#portals' },
    { name: 'Capacity Radar', href: '#capacity' },
    { name: 'Specialists', href: '#specialists' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Contact', href: '#contact' },
  ];

  const scrollTo = (id: string) => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
    if (id === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.querySelector(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-blue-600 selection:text-white">
      {/* 1. Live Emergency & Operations Top Banner */}
      <EmergencyTicker />

      {/* 2. Sticky Healthcare Navigation Bar */}
      <nav className="sticky top-0 w-full z-40 bg-white/85 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer shrink-0"
            onClick={() => scrollTo('#')}
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
              <Activity size={22} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                MedPulse<span className="text-blue-600">HMS</span>
              </span>
              <span className="text-[10px] font-mono text-slate-600 font-semibold tracking-wider uppercase mt-0.5">
                Hospital Operating System
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.name}
                type="button"
                onClick={() => scrollTo(link.href)}
                className="px-3 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-slate-100/60"
              >
                {link.name}
              </button>
            ))}

            {/* Portals Dropdown */}
            <div className="relative ml-2">
              <button
                type="button"
                onMouseEnter={() => setActiveDropdown('portals')}
                onClick={() => setActiveDropdown(activeDropdown === 'portals' ? null : 'portals')}
                className="px-3.5 py-2 text-sm font-bold text-blue-600 bg-blue-50/80 hover:bg-blue-100/80 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <span>Role Portals</span>
                <ChevronRight
                  size={14}
                  className={`transition-transform duration-200 ${
                    activeDropdown === 'portals' ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {activeDropdown === 'portals' && (
                <div
                  onMouseLeave={() => setActiveDropdown(null)}
                  className="absolute top-full right-0 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    Direct Role Workspaces
                  </div>
                  {portals.map((portal) => (
                    <Link
                      key={portal.name}
                      to={portal.path}
                      onClick={() => setActiveDropdown(null)}
                      className="flex flex-col p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-blue-600">
                        <span>{portal.name}</span>
                        <ArrowRight size={13} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                      <span className="text-[11px] text-slate-500 mt-0.5">{portal.desc}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              type="button"
              onClick={() => scrollTo('#ai-top-assistant')}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-95 shadow-sm"
            >
              <Sparkles size={13} className="text-amber-300" />
              <span>AI Assistant</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            {user ? (
              <Link
                to="/dashboard"
                className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-md shadow-slate-200"
              >
                <span>Enter Dashboard</span>
                <ArrowRight size={15} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-white border-b border-slate-200 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {navLinks.map((link) => (
                    <button
                      key={link.name}
                      type="button"
                      onClick={() => scrollTo(link.href)}
                      className="text-left py-2 px-3 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg"
                    >
                      {link.name}
                    </button>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Direct Portals:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {portals.map((portal) => (
                      <Link
                        key={portal.name}
                        to={portal.path}
                        onClick={() => setIsMenuOpen(false)}
                        className="p-2.5 bg-slate-50 rounded-xl text-xs font-bold text-slate-800 border border-slate-100 hover:border-blue-200 block"
                      >
                        {portal.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-2">
                  {user ? (
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-center text-sm shadow-md"
                    >
                      Enter Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-1/2 border border-slate-300 text-slate-700 py-3 rounded-xl font-bold text-center text-sm"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-1/2 bg-blue-600 text-white py-3 rounded-xl font-bold text-center text-sm shadow-md"
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 3. Hero Section */}
      <section className="relative pt-12 md:pt-16 pb-16 px-4 md:px-6 overflow-hidden">
        {/* Subtle geometric ambient accents */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-blue-100/40 via-indigo-50/20 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Left Hero copy */}
            <div className="lg:col-span-6 space-y-6">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200/80 rounded-full shadow-sm text-blue-700">
                <Sparkles size={14} className="text-blue-600 animate-pulse" />
                <span className="text-xs font-bold">
                  24/7 AI Clinical Assistant Active • HIPAA & ISO 27001 Certified
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.05]">
                Next-Generation Clinical Operations & AI Healthcare.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                MedPulse combines Google Gemini AI clinical triage with enterprise hospital management — providing instant symptom evaluation, differential insights, and synchronized patient care.
              </p>

              {/* Instant Symptom Prompt Chips */}
              <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                  Test AI Assistant:
                </span>
                <button
                  type="button"
                  onClick={() => scrollTo('#ai-top-assistant')}
                  className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition-colors border border-blue-200/60 flex items-center gap-1"
                >
                  <span>Chest tightness</span>
                  <ArrowRight size={10} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo('#ai-top-assistant')}
                  className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 transition-colors border border-indigo-200/60 flex items-center gap-1"
                >
                  <span>High fever & cough</span>
                  <ArrowRight size={10} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo('#ai-top-assistant')}
                  className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-semibold hover:bg-purple-100 transition-colors border border-purple-200/60 flex items-center gap-1"
                >
                  <span>Severe migraine</span>
                  <ArrowRight size={10} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => scrollTo('#ai-top-assistant')}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
                >
                  <BrainCircuit size={16} />
                  <span>Consult AI Assistant at Top</span>
                </button>

                <Link
                  to="/dashboard/patient"
                  className="px-6 py-3.5 bg-white hover:bg-slate-100 active:scale-95 text-slate-800 border border-slate-200 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-all"
                >
                  <span>Launch Patient Portal</span>
                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* Verified Trust Stats */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-black font-mono text-slate-900">450+</div>
                  <div className="text-xs text-slate-600 font-medium">Hospitals & Clinics</div>
                </div>
                <div>
                  <div className="text-2xl font-black font-mono text-slate-900">99.99%</div>
                  <div className="text-xs text-slate-600 font-medium">Clinical Uptime</div>
                </div>
                <div>
                  <div className="text-2xl font-black font-mono text-slate-900">&lt; 45s</div>
                  <div className="text-xs text-slate-600 font-medium">AI Triage Speed</div>
                </div>
              </div>
            </div>

            {/* Right Hero Graphic: Live Top AI Assistant Card (with Telemetry Switcher) */}
            <div className="lg:col-span-6">
              <HeroAiAssistantCard />
            </div>
          </div>

          {/* 4. High-Utility Quick Doctor & Appointment Finder */}
          <div className="pt-4">
            <QuickDoctorFinder />
          </div>
        </div>
      </section>

      {/* 5. Role-Based Hospital Operations Hub */}
      <div id="portals">
        <RoleExperienceHub />
      </div>

      {/* 6. Unified Hospital Core Services */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
              <Layers size={14} />
              <span>Full-Stack Clinical Architecture</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
              Unified Hospital Core Platform
            </h2>
            <p className="text-slate-600 text-base md:text-lg mt-3">
              Meticulously engineered micro-modules that communicate over secured real-time event buses to ensure zero patient data lag.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-7 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-blue-200 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Stethoscope size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Physician Workstation</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Longitudinal patient timelines, instant lab retrieval, automated e-prescriptions, and smart rounding schedules.
              </p>
              <div className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Explore Doctor Features</span>
                <ArrowRight size={13} />
              </div>
            </div>

            <div className="p-7 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-indigo-200 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BrainCircuit size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Gemini AI Clinical Co-Pilot</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Real-time differential diagnosis suggestion, drug-drug interaction warning engine, and speech transcription.
              </p>
              <div className="text-xs font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>View AI Decision Support</span>
                <ArrowRight size={13} />
              </div>
            </div>

            <div className="p-7 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-emerald-200 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Bed size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Ward & Bed Telemetry</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Interactive hospital floor layout, automated ICU capacity tracking, patient bed transfers, and sanitize status.
              </p>
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Review Bed Management</span>
                <ArrowRight size={13} />
              </div>
            </div>

            <div className="p-7 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-cyan-200 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Electronic Medical Records</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Fast HL7 and FHIR interoperability, instant PDF report generation, and cryptographically signed audit logs.
              </p>
              <div className="text-xs font-bold text-cyan-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Inspect Record Architecture</span>
                <ArrowRight size={13} />
              </div>
            </div>

            <div className="p-7 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-amber-200 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Billing & Automated Claims</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Pre-authorization checks, real-time insurance co-pay estimation, itemized pharmacy bills, and payment gateway.
              </p>
              <div className="text-xs font-bold text-amber-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Explore Revenue Engine</span>
                <ArrowRight size={13} />
              </div>
            </div>

            <div className="p-7 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-purple-200 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Heart size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Central Dispensary & Stock</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Zero-stockout alerts, batch expiry warnings, automated drug dispensing queues, and narcotic ledger control.
              </p>
              <div className="text-xs font-bold text-purple-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>View Pharmacy Integration</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Real-Time Hospital Capacity Radar */}
      <div id="capacity">
        <HospitalCapacityRadar />
      </div>

      {/* 8. Interactive AI Assistant & Clinical Co-Pilot Section */}
      <section id="ai-copilot" className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Left information */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={14} />
                <span>Next-Gen Diagnostic Intelligence</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
                AI Clinical Co-Pilot & Symptom Triage.
              </h2>

              <p className="text-slate-600 text-base md:text-lg leading-relaxed">
                Test our real-time triage engine powered by Gemini. Dictate or select symptoms to receive preliminary differential diagnosis insights, urgent care scores (1-10), medication warnings, and voice guidance.
              </p>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-3 shadow-sm">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Evidence-Grounded Triage</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Calculates urgency ratings based on medical protocols before physician examination.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-3 shadow-sm">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Voice-Enabled Accessibility</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Supports microphone dictation and browser speech synthesis for audio readout.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Interactive AI Console */}
            <div className="lg:col-span-6">
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                      <BrainCircuit size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">MedPulse AI Clinical Assistant</h4>
                      <span className="text-[10px] text-emerald-600 font-mono font-bold uppercase">
                        Active & Ready
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                    v3.5-flash
                  </span>
                </div>

                <InteractiveAiTriage />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Board-Certified Specialists Directory */}
      <section id="specialists" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
                <Award size={14} />
                <span>Verified Clinical Faculty</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                World-Class Medical Specialists
              </h2>
              <p className="text-slate-600 text-base mt-1">
                Fellowship-trained department chairs available for in-clinic consultations and encrypted telehealth.
              </p>
            </div>

            <Link
              to="/dashboard/patient"
              className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 group"
            >
              <span>View Full 42 Specialist Roster</span>
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Dr. Sarah Jenkins, MD',
                specialty: 'Neurology & Neuro-Critical Care',
                school: 'Harvard Medical School Fellow',
                rating: 4.98,
                reviews: 184,
                nextSlot: 'Today, 2:30 PM',
                img: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=2670&auto=format&fit=crop',
              },
              {
                name: 'Dr. Michael Chen, MD',
                specialty: 'Cardiology & Interventional Care',
                school: 'Johns Hopkins University Fellow',
                rating: 4.95,
                reviews: 210,
                nextSlot: 'Today, 4:15 PM',
                img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2670&auto=format&fit=crop',
              },
              {
                name: 'Dr. Elena Rodriguez, MD',
                specialty: 'Pediatrics & Adolescent Medicine',
                school: 'Stanford Children’s Health Alum',
                rating: 4.92,
                reviews: 142,
                nextSlot: 'Tomorrow, 9:00 AM',
                img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=2670&auto=format&fit=crop',
              },
              {
                name: 'Dr. James Wilson, MD',
                specialty: 'Orthopedics & Joint Replacement',
                school: 'Mayo Clinic Orthopedic Alum',
                rating: 4.89,
                reviews: 168,
                nextSlot: 'Today, 5:00 PM',
                img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=2670&auto=format&fit=crop',
              },
            ].map((doc) => (
              <div
                key={doc.name}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="h-60 overflow-hidden relative">
                    <img
                      src={doc.img}
                      alt={doc.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm text-amber-700 border border-amber-100">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span>{doc.rating}</span>
                      <span className="text-slate-400 font-normal">({doc.reviews})</span>
                    </div>
                  </div>

                  <div className="p-5">
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
                      {doc.specialty}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {doc.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{doc.school}</p>

                    <div className="mt-3 py-1.5 px-2.5 bg-emerald-50 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-1.5 border border-emerald-100">
                      <Clock size={12} className="text-emerald-600 shrink-0" />
                      <span>Next Slot: {doc.nextSlot}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    to={`/dashboard/patient?doctor=${encodeURIComponent(doc.name)}`}
                    className="w-full py-2.5 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Book Consultation</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Transparent Procedure & Consultation Cost Estimator */}
      <div id="pricing">
        <CostEstimator />
      </div>

      {/* 11. Security & Compliance Deep-Dive */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck size={28} />
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Enterprise Clinical Security & Zero-Trust Architecture
              </h2>

              <p className="text-slate-600 text-base leading-relaxed">
                Hospital records represent the most sensitive data in existence. MedPulse is architected with defense-in-depth protocols meeting and exceeding global healthcare data standards.
              </p>

              <div className="space-y-3.5">
                {[
                  {
                    title: 'AES-256 at Rest & TLS 1.3 in Transit',
                    desc: 'Military-grade cryptographic encryption across all database records and real-time streams.',
                  },
                  {
                    title: 'Immutable Cryptographic Audit Trails',
                    desc: 'Every chart review, prescription change, and patient access is signed and tamper-proof.',
                  },
                  {
                    title: 'Strict Role-Based Access Control (RBAC)',
                    desc: 'Doctors, nurses, receptionists, and patients only access authorized data boundaries.',
                  },
                ].map((sec, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                      <CheckCircle2 size={13} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{sec.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{sec.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-3xl font-black font-mono text-slate-900">ISO 27001</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                  Certified Security
                </div>
                <p className="text-xs text-slate-400 mt-2">Information security management standard certified.</p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-3xl font-black font-mono text-slate-900">HIPAA</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                  Compliant BAA
                </div>
                <p className="text-xs text-slate-400 mt-2">Full Business Associate Agreement coverage for all PHI.</p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-3xl font-black font-mono text-slate-900">SOC 2</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                  Type II Audited
                </div>
                <p className="text-xs text-slate-400 mt-2">Independent third-party verification of controls.</p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-3xl font-black font-mono text-slate-900">99.99%</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                  SLA Guarantee
                </div>
                <p className="text-xs text-slate-400 mt-2">Multi-region active-active failover clustering.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 12. Verified Endorsements & Testimonials */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Trusted by Medical Leaders & Patients
            </h2>
            <p className="text-slate-600 text-base mt-2">
              Transforming hospital efficiency and patient outcomes around the world.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  'MedPulse reduced our emergency intake queue from 28 minutes to under 7 minutes. The real-time bed telemetry alone transformed our ward turnover.',
                author: 'Dr. Robert Vance, MD',
                role: 'Chief Medical Officer, St. Jude Regional Hospital',
              },
              {
                quote:
                  'As a patient managing chronic hypertension, having direct access to my cardiology lab trends and instant prescription refills has given me peace of mind.',
                author: 'Eleanor Vance',
                role: 'Patient Member, Austin Medical Wing',
              },
              {
                quote:
                  'Our billing discrepancies dropped by 42% in our very first billing cycle. Insurance pre-authorizations are handled seamlessly upon patient registration.',
                author: 'Marcus Sterling',
                role: 'Hospital Administrative Director, Metro Health System',
              },
            ].map((t, i) => (
              <div
                key={i}
                className="p-7 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                    <Quote size={20} />
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed italic mb-6">
                    "{t.quote}"
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <div className="font-bold text-slate-900 text-sm">{t.author}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 13. Frequently Asked Questions (FAQ) */}
      <FaqSection />

      {/* 14. High-Impact CTA Banner */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-14 border border-slate-800 shadow-2xl relative overflow-hidden text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-500/30">
              <Zap size={14} />
              <span>Modernize Hospital Operations</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-2xl mx-auto leading-tight">
              Ready to Upgrade Your Clinical Experience?
            </h2>

            <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Experience the future of healthcare today. Access patient records, consult our diagnostic AI co-pilot, or schedule an appointment in under a minute.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/register"
                className="px-7 py-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all"
              >
                Create Free Account
              </Link>
              <Link
                to="/dashboard/patient"
                className="px-7 py-4 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-sm rounded-xl border border-slate-700 transition-all"
              >
                Instant Patient Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 15. Contact Section */}
      <section id="contact" className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
                <Phone size={14} />
                <span>24/7 Clinical & IT Support</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Connect with the MedPulse Medical Team
              </h2>

              <p className="text-slate-600 text-sm leading-relaxed">
                Whether you need urgent clinical dispatch, hospital deployment support, or assistance navigating your patient chart, our medical support desk is available around the clock.
              </p>

              <div className="space-y-4 pt-2">
                <ContactInfoItem
                  icon={<Phone size={18} />}
                  title="24/7 Emergency Line"
                  value="+1 (888) MED-PULSE (+1 888-633-7857)"
                />
                <ContactInfoItem
                  icon={<Mail size={18} />}
                  title="Clinical Support & Queries"
                  value="support@medpulse.hospital"
                />
                <ContactInfoItem
                  icon={<MapPin size={18} />}
                  title="Hospital Center Campus"
                  value="MedPulse Center, 742 Healthcare Parkway, Suite 100"
                />
              </div>
            </div>

            <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40">
              <h3 className="text-xl font-bold text-slate-900 mb-1">Send a Clinical or IT Inquiry</h3>
              <p className="text-xs text-slate-500 mb-6">Our triage desk will route your message to the appropriate specialist.</p>
              <ContactFormSimple />
            </div>
          </div>
        </div>
      </section>

      {/* 16. Professional Medical Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2 text-white">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Activity size={18} />
                </div>
                <span className="text-lg font-bold tracking-tight">MedPulse<span className="text-blue-500">HMS</span></span>
              </div>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                The premier healthcare management ecosystem. Integrating electronic health records, automated telemetry, and Gemini clinical intelligence.
              </p>
              <div className="text-[11px] text-slate-500">
                Operating System Build: v4.2.0 • ISO 27001 & HIPAA Compliant
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Clinical Portals</h4>
              <ul className="space-y-2">
                <li><Link to="/dashboard/patient" className="hover:text-white transition-colors">Patient Portal</Link></li>
                <li><Link to="/dashboard/doctor" className="hover:text-white transition-colors">Doctor Workstation</Link></li>
                <li><Link to="/dashboard/receptionist" className="hover:text-white transition-colors">Front Desk Triage</Link></li>
                <li><Link to="/dashboard/admin" className="hover:text-white transition-colors">Admin & Telemetry</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Services</h4>
              <ul className="space-y-2">
                <li><button type="button" onClick={() => scrollTo('#ai-top-assistant')} className="hover:text-white transition-colors">AI Clinical Assistant (Top)</button></li>
                <li><button type="button" onClick={() => scrollTo('#capacity')} className="hover:text-white transition-colors">Capacity Radar</button></li>
                <li><button type="button" onClick={() => scrollTo('#specialists')} className="hover:text-white transition-colors">Specialist Directory</button></li>
                <li><button type="button" onClick={() => scrollTo('#pricing')} className="hover:text-white transition-colors">Cost Estimator</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Emergency</h4>
              <ul className="space-y-2">
                <li><span className="text-red-400 font-bold">Ambulance: 911</span></li>
                <li><span className="text-white">Hotline: (888) MED-PULSE</span></li>
                <li><span>Trauma Wing: Bay 1-4</span></li>
                <li><span>Poison Control: 1-800-222-1222</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              © 2026 MedPulse Premiere Hospital Management Systems LLC. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <span className="hover:text-slate-400 cursor-pointer">Privacy Practices (HIPAA)</span>
              <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-400 cursor-pointer">Patient Bill of Rights</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ContactFormSimple() {
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    department: 'General Patient Care',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Your message has been safely logged in the triage queue.');
    }, 900);
  };

  if (submitted) {
    return (
      <div className="text-center py-10 space-y-4">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
          <CheckCircle2 size={28} />
        </div>
        <h4 className="text-lg font-bold text-slate-900">Message Dispatched Successfully</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Our on-duty administrative coordinator will review your request and reply to <strong>{formData.email}</strong> within 2 hours.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setFormData({ name: '', email: '', department: 'General Patient Care', message: '' });
          }}
          className="text-xs font-bold text-blue-600 hover:underline"
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Full Name
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. John Doe"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="name@example.com"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
          Inquiry Department
        </label>
        <select
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
        >
          <option>General Patient Care</option>
          <option>Appointments & Rescheduling</option>
          <option>Medical Records & Lab Inquiries</option>
          <option>Billing & Insurance Pre-Authorization</option>
          <option>Enterprise Hospital HMS Partnership</option>
        </select>
      </div>

      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
          Message Details
        </label>
        <textarea
          required
          rows={3}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Please describe how our clinical or support team can assist..."
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <span>Submit Clinical Inquiry</span>
            <ArrowRight size={15} />
          </>
        )}
      </button>
    </form>
  );
}

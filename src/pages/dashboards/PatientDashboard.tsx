import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Heart, Calendar, FileText, CreditCard, Activity, 
  MessageSquare, Sparkles, Send, BrainCircuit, Thermometer,
  ChevronRight, ArrowUpRight, Download, CheckCircle2, AlertCircle,
  TrendingUp, Search, Filter, Mic, MicOff, Activity as ActivityIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn, formatCurrency } from '../../lib/utils';
import axios from 'axios';
import { getAppointments, getBilling, createAppointment, getNotifications, createNotification } from '../../services/firestoreService';
import NotificationCenter from '../../components/common/NotificationCenter';
import toast from 'react-hot-toast';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user) return;
    // Seed notifications for patient
    const checkAndSeedNotifs = async () => {
      const unsubscribeNotifs = getNotifications(async (notifs) => {
        if (notifs.length === 0) {
          await createNotification(user.uid, 'Appointment Confirmed', 'Your visit with Dr. Jenkins is confirmed for Monday.', 'success');
          await createNotification(user.uid, 'New Lab Results', 'Your blood test results are ready to view.', 'info');
        }
        unsubscribeNotifs();
      }, user.uid);
    };
    checkAndSeedNotifs();
  }, [user]);

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <NotificationCenter />
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Your Health Hub</h1>
            <p className="text-slate-500 text-sm">Manage your wellness and appointments effortlessly.</p>
          </div>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Overview" />
          <TabButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} label="Medical Files" />
          <TabButton active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} label="Billing" />
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'billing' && <BillingHistory />}
          {activeTab === 'reports' && <ReportsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function OverviewTab() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = getAppointments(async (data) => {
      if (data.length === 0 && !loading) {
        // Seed mock consultations for demo purposes if none exist
        const mockAppts = [
          {
            doctorName: 'Dr. Sarah Jenkins',
            date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days from now
            time: '02:00 PM',
            type: 'General Check-up',
            notes: 'Regular health monitoring',
            patientId: user.uid,
            patientName: user.displayName || 'Patient',
            status: 'confirmed'
          },
          {
            doctorName: 'Dr. Michael Chen',
            date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], // 5 days from now
            time: '10:30 AM',
            type: 'Cardiology Follow-up',
            notes: 'High blood pressure review',
            patientId: user.uid,
            patientName: user.displayName || 'Patient',
            status: 'pending'
          }
        ];
        for (const appt of mockAppts) {
          await createAppointment(appt);
        }
      }
      setAppointments(data);
      setLoading(false);
    }, 'patient', user.uid);
    return () => unsubscribe();
  }, [user, loading]);

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      {/* Left Column - Main Stats & Schedule */}
      <div className="lg:col-span-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HealthMetricCard 
            label="Heart Rate" 
            value="72" 
            unit="BPM" 
            status="Normal" 
            icon={<Heart size={20} />} 
            color="text-red-500"
            bgColor="bg-red-50"
          />
          <HealthMetricCard 
            label="Blood Glucose" 
            value="94" 
            unit="mg/dL" 
            status="Excellent" 
            icon={<Activity size={20} />} 
            color="text-blue-500"
            bgColor="bg-blue-50"
          />
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900">Upcoming Visits</h3>
            <Link to="/appointments" className="text-sm font-bold text-blue-600 px-4 py-2 hover:bg-blue-50 rounded-xl transition-colors">Book New</Link>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Syncing consultations...</div>
            ) : appointments.length > 0 ? (
              appointments.slice(0, 3).map(apt => (
                <BookingItem 
                  key={apt.id}
                  doctor={apt.doctorName} 
                  dept={apt.type} 
                  date={new Date(apt.date).toLocaleDateString()} 
                  time={apt.time} 
                  status={apt.status === 'pending' ? 'Pending' : 'Confirmed'}
                />
              ))
            ) : (
              <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400">
                You have no upcoming consultations.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - AI Symptom Checker & Quick Actions */}
      <div className="lg:col-span-4 space-y-8">
        <SymptomChecker />

        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
              <FileText size={24} className="text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Prescription Wallet</h3>
            <p className="text-slate-400 text-sm mb-6">Download and view your latest prescriptions.</p>
            <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-2 group-hover:bg-blue-50 transition-all">
              Access Wallet
              <ArrowUpRight size={18} />
            </button>
          </div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />
        </div>
      </div>
    </div>
  );
}

function BillingHistory() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = getBilling((data) => {
      setInvoices(data);
      setLoading(false);
    }, 'patient', user.uid);
    return () => unsubscribe();
  }, [user]);

  const totalSpent = invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const outstanding = invoices.filter(i => i.status === 'pending').reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Billing Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinanceStatCard title="Total Spent" value={formatCurrency(totalSpent)} icon={<TrendingUp size={18} />} color="blue" />
        <FinanceStatCard title="Outstanding" value={formatCurrency(outstanding)} icon={<AlertCircle size={18} />} color="indigo" />
        <FinanceStatCard title="Last Payment" value={formatCurrency(invoices[0]?.amount || 0)} icon={<CreditCard size={18} />} color="emerald" />
        <FinanceStatCard title="Insurance Saved" value="$8,420.00" icon={<Sparkles size={18} />} color="emerald" />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-slate-900">Invoices & Payments</h3>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search invoices..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/10"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400 font-bold border-b border-slate-100">
                <th className="px-8 py-4">Invoice ID</th>
                <th className="px-8 py-4">Service Description</th>
                <th className="px-8 py-4">Date</th>
                <th className="px-8 py-4">Amount</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-8 py-12 text-center text-slate-400">Fetching financial records...</td></tr>
              ) : invoices.length > 0 ? (
                invoices.map(invoice => (
                  <PatientInvoiceRow 
                    key={invoice.id}
                    id={invoice.invoiceId || invoice.id} 
                    service={invoice.service} 
                    date={new Date(invoice.createdAt?.seconds * 1000).toLocaleDateString()} 
                    amount={invoice.amount} 
                    status={invoice.status} 
                  />
                ))
              ) : (
                <tr><td colSpan={6} className="px-8 py-12 text-center text-slate-400">No invoices found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReportsTab() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <FileCard title="Lab Results - Blood Panel" date="May 12, 2026" type="PDF" size="1.2 MB" />
      <FileCard title="Radiology Report - Chest X-Ray" date="May 10, 2026" type="DICOM" size="24.5 MB" />
      <FileCard title="Prescription - Cardiology" date="May 12, 2026" type="PDF" size="0.4 MB" />
      <FileCard title="Discharge Summary" date="April 28, 2026" type="PDF" size="1.8 MB" />
    </div>
  );
}

function FinanceStatCard({ title, value, icon, color }: any) {
  const colorMap: any = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between h-32">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
        <div className={cn("p-2 rounded-xl", colorMap[color])}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
    </div>
  );
}

function PatientInvoiceRow({ id, service, date, amount, status }: any) {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-8 py-5">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-900">{id}</span>
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="text-sm font-bold text-slate-700">{service}</div>
      </td>
      <td className="px-8 py-5 text-xs text-slate-400 font-bold">{date}</td>
      <td className="px-8 py-5 text-sm font-bold text-slate-900">{formatCurrency(amount)}</td>
      <td className="px-8 py-5">
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1 w-fit",
          status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
        )}>
          {status === 'paid' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
          {status}
        </span>
      </td>
      <td className="px-8 py-5 text-right">
        <button className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-blue-600 shadow-sm transition-all opacity-0 group-hover:opacity-100">
          <Download size={18} />
        </button>
      </td>
    </tr>
  );
}

function FileCard({ title, date, type, size }: any) {
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm group hover:border-blue-200 transition-all cursor-pointer">
      <div className="flex items-center justify-between mb-6">
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
          <FileText size={24} />
        </div>
        <span className="text-[10px] font-black uppercase text-slate-300 group-hover:text-blue-100 transition-colors">{type}</span>
      </div>
      <h4 className="text-sm font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">{title}</h4>
      <p className="text-[10px] text-slate-400 font-bold mb-6">{date} • {size}</p>
      <button className="w-full py-3 bg-slate-50 rounded-2xl text-xs font-bold text-slate-600 flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white transition-all">
        <Download size={14} />
        Download
      </button>
    </div>
  );
}

function HighlightedText({ text, className = "" }: { text: string, className?: string }) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <p className={className}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <span key={i} className={cn("font-black px-1.5 py-0.5 rounded-md mx-0.5 inline-block ring-1 italic transition-all", 
              className.includes('text-white') ? "bg-white/20 text-white ring-white/30" : "bg-blue-600/10 text-blue-700 ring-blue-600/20")}>
              {part.slice(2, -2)}
            </span>
          );
        }
        return part;
      })}
    </p>
  );
}

function SymptomChecker() {
  const [query, setQuery] = useState('');
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = React.useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setQuery(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const getAIdiagnosis = async () => {
    if (!query) return;
    setLoading(true);
    setDiagnosis(null);
    try {
      const response = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: query }),
      });
      if (!response.ok) {
        throw new Error("Failed to get diagnosis");
      }
      const data = await response.json();
      if (!data || data.error) {
        throw new Error(data?.error || "Failed to process symptoms");
      }
      setDiagnosis(data);
    } catch (e: any) {
      toast.error(e.message || "MedPulse AI is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-xl shadow-blue-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4">
        <Sparkles className="text-blue-200" size={40} />
      </div>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
          <BrainCircuit size={24} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">AI Diagnostic Assistant</h3>
      </div>

      <div className="space-y-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">How are you feeling?</p>
        <div className="relative group">
          <textarea 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe your symptoms in detail (e.g. persistent cough, high fever, sore throat)..."
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/10 resize-none h-32 pr-24"
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button 
              type="button"
              onClick={toggleRecording}
              className={cn(
                "p-3 rounded-xl shadow-lg transition-all active:scale-95",
                isRecording ? "bg-red-500 text-white animate-pulse" : "bg-white text-slate-400 border border-slate-100 hover:text-blue-600"
              )}
            >
              {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <button 
              onClick={getAIdiagnosis}
              disabled={loading || !query.trim()}
              className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50 transition-all hover:bg-blue-700"
            >
              {loading ? <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" /> : <Send size={20} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {diagnosis && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 p-6 bg-blue-50/50 border border-blue-100 rounded-3xl"
            >
              <div>
                <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                   <ActivityIcon size={12} /> Potential Diagnosis
                </div>
                <div className="text-sm font-bold text-slate-900">
                  <HighlightedText text={diagnosis.diagnosis} />
                </div>
              </div>
              
              <div>
                <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                   <FileText size={12} /> Suggested Prescription/Action
                </div>
                <div className="text-sm text-slate-700">
                  <HighlightedText text={diagnosis.prescription} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-2xl border border-blue-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Urgency</div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${diagnosis.urgency * 10}%` }}
                        className={cn("h-full", diagnosis.urgency > 7 ? "bg-red-500" : "bg-blue-500")}
                      />
                    </div>
                    <span className="text-xs font-bold">{diagnosis.urgency}/10</span>
                  </div>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-blue-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</div>
                  <div className="text-xs font-bold text-blue-600 uppercase">{diagnosis.urgency > 7 ? 'Urgent Care' : 'Home Care'}</div>
                </div>
              </div>

              <div className="p-3 bg-indigo-600 rounded-2xl text-white">
                <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-1">AI Advice</p>
                <div className="text-xs leading-relaxed mb-3">
                  <HighlightedText text={diagnosis.advice} className="text-white" />
                </div>
                <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                  <div className="text-[9px] font-bold text-blue-200 uppercase mb-1">Voice Agent Brief</div>
                  <p className="text-xs italic text-blue-50">"{diagnosis.voiceAdvice}"</p>
                </div>
              </div>

              <p className="text-[9px] text-slate-400 font-medium italic border-t border-blue-100 pt-3">
                {diagnosis.warning}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-start gap-2 text-[10px] text-slate-400 font-medium">
          <AlertCircle size={14} className="shrink-0" />
          <span>This AI assistant provides general information only. In case of emergency, call local emergency services immediately.</span>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
        active ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-900"
      )}
    >
      {label}
    </button>
  );
}

function HealthMetricCard({ label, value, unit, status, icon, color, bgColor }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
      <div className="flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110", bgColor, color)}>
          {icon}
        </div>
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</div>
          <div className="text-xl font-bold text-slate-900">{value} <span className="text-sm font-medium text-slate-400">{unit}</span></div>
        </div>
      </div>
      <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", bgColor, color)}>
        {status}
      </div>
    </div>
  );
}

function BookingItem({ doctor, dept, date, time, status }: any) {
  return (
    <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-white hover:border-blue-100 transition-all cursor-pointer group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600 font-bold border border-slate-100">
          {doctor.charAt(4)}
        </div>
        <div>
          <div className="text-sm font-bold text-slate-900">{doctor}</div>
          <div className="text-xs text-slate-500 font-medium">{dept} • {date}</div>
        </div>
      </div>
      <div className="flex items-center gap-6 w-full md:w-auto">
        <div className="text-sm font-bold text-slate-700">{time}</div>
        <div className={cn(
          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
          status === 'Confirmed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
        )}>
          {status}
        </div>
        <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
      </div>
    </div>
  );
}

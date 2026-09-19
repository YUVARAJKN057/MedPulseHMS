import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Users, FileText, Clock, ChevronRight, Video, 
  FilePlus, ArrowRight, BrainCircuit, Sparkles, Send, Activity,
  AlertCircle, Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { getAppointments, createAppointment, getNotifications, createNotification } from '../../services/firestoreService';
import NotificationCenter from '../../components/common/NotificationCenter';
import toast from 'react-hot-toast';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Seed notifications for doctor
    const checkAndSeedNotifs = async () => {
      const unsubscribeNotifs = getNotifications(async (notifs) => {
        if (notifs.length === 0) {
          await createNotification(user.uid, 'Welcome to MedPulse', 'Welcome to your doctor dashboard. You have a busy day ahead!');
          await createNotification(user.uid, 'System Update', 'New AI clinical model v2.1 is now active.', 'info');
        }
        unsubscribeNotifs();
      }, user.uid);
    };
    checkAndSeedNotifs();

    const unsubscribe = getAppointments(async (data) => {
      if (data.length === 0 && !loading) {
        // Seed mock consultations for the doctor if none exist
        const mockAppts = [
          {
            doctorName: user.displayName || 'Dr. Practitioner',
            doctorId: user.uid,
            date: new Date().toISOString().split('T')[0],
            time: '09:30 AM',
            type: 'Cardiology Consultation',
            notes: 'Initial evaluation for chest discomfort',
            patientId: 'demo-patient-1',
            patientName: 'John Doe',
            status: 'waiting',
            urgent: true
          },
          {
            doctorName: user.displayName || 'Dr. Practitioner',
            doctorId: user.uid,
            date: new Date().toISOString().split('T')[0],
            time: '11:00 AM',
            type: 'Routine Check-up',
            notes: 'Annual physical examination',
            patientId: 'demo-patient-2',
            patientName: 'Jane Smith',
            status: 'scheduled',
            urgent: false
          }
        ];
        for (const appt of mockAppts) {
          await createAppointment(appt);
        }
      }
      setAppointments(data);
      setLoading(false);
    }, 'doctor', user.uid);
    return () => unsubscribe();
  }, [user, loading]);

  const stats = {
    totalPatients: appointments.length,
    pending: appointments.filter(a => a.status === 'pending' || a.status === 'waiting' || a.status === 'scheduled').length,
    urgent: appointments.filter(a => a.urgent).length
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <NotificationCenter />
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Good morning, {user?.displayName}</h1>
            <p className="text-slate-500">You have {stats.pending} appointments scheduled for today.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
            <Clock size={18} />
            Update Schedule
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
            <Video size={18} />
            Start Consultation
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Appointments */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden min-h-[400px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-10" />
            
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-900">Queue Status</h3>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {stats.pending} Patients Pending
              </span>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="p-8 text-center text-slate-400">Loading your schedule...</div>
              ) : appointments.length > 0 ? (
                appointments.map((apt, idx) => (
                  <AppointmentItem 
                    key={apt.id}
                    time={apt.time} 
                    name={apt.patientName} 
                    reason={apt.type} 
                    type={apt.urgent ? 'Emergency' : 'Regular'} 
                    status={idx === 0 ? 'next' : (apt.urgent ? 'urgent' : 'wait')}
                  />
                ))
              ) : (
                <div className="p-12 text-center text-slate-400">No scheduled visits for today.</div>
              )}
            </div>
          </div>

          <AIClinicalAssistant />

          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white overflow-hidden relative group">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Patient Records</h3>
                  <p className="text-slate-400 text-sm">Access clinical data and visit summaries.</p>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                  <FileText size={20} className="text-blue-400" />
                </div>
              </div>
              <button className="flex items-center gap-2 text-blue-400 font-bold hover:gap-4 transition-all">
                Browse Repository
                <ArrowRight size={18} />
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px]" />
          </div>
        </div>

        {/* Right Column - Stats & History */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Medical Insights</h3>
            <div className="space-y-4">
              <InsightItem label="Patients Seen" value={stats.totalPatients.toString()} icon={<Users className="text-blue-600" size={18} />} />
              <InsightItem label="Urgent Cases" value={stats.urgent.toString()} icon={<FilePlus className="text-emerald-600" size={18} />} />
              <InsightItem label="Total Hours" value="0.0" icon={<Clock className="text-orange-600" size={18} />} />
            </div>
            <div className="mt-8 pt-8 border-t border-slate-100">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Patient Satisfaction</div>
              <div className="flex items-end gap-1 h-20">
                {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="flex-1 bg-blue-100 rounded-t-lg group relative"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Day {i+1}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AIClinicalAssistant() {
  const [query, setQuery] = useState('');
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">AI Clinical Co-Pilot</h3>
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Diagnostic & Prescription Support</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <textarea 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter patient symptoms and clinical observations..."
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/10 resize-none h-32"
          />
          <button 
            onClick={getAIdiagnosis}
            disabled={loading}
            className="absolute bottom-4 right-4 p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50 transition-all"
          >
            {loading ? <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" /> : <Send size={20} />}
          </button>
        </div>

        <AnimatePresence>
          {diagnosis && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid md:grid-cols-2 gap-4 p-6 bg-blue-50/50 border border-blue-100 rounded-3xl"
            >
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                     <Activity size={12} /> Clinical Assessment
                  </div>
                  <p className="text-sm font-bold text-slate-900">{diagnosis.diagnosis}</p>
                </div>
                
                <div>
                  <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                     <FilePlus size={12} /> Prescription Suggestions
                  </div>
                  <p className="text-sm text-slate-700">{diagnosis.prescription}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white rounded-2xl border border-blue-100 h-full">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                    Urgency Rating
                    <span className="text-xs font-bold text-slate-900">{diagnosis.urgency}/10</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${diagnosis.urgency * 10}%` }}
                      className={cn("h-full", diagnosis.urgency > 7 ? "bg-red-500" : "bg-blue-500")}
                    />
                  </div>
                  <div className="mt-4">
                    <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-1 text-slate-400">Logic & Next Steps</p>
                    <p className="text-xs leading-relaxed text-slate-600">{diagnosis.advice}</p>
                  </div>
                </div>
              </div>

              <div className="col-span-full p-3 bg-slate-900 rounded-2xl text-slate-400 flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <p className="text-[9px] font-medium italic">
                  Decision support only. Clinical judgment must prevail. {diagnosis.warning}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function AppointmentItem({ time, name, reason, type, status }: any) {
  const statusStyles = {
    next: "border-blue-600 bg-blue-50/50",
    urgent: "border-red-600 bg-red-50/50",
    wait: "border-transparent bg-slate-50"
  };
  
  return (
    <div className={cn("p-5 border-l-4 rounded-2xl flex items-center justify-between transition-all hover:translate-x-1", statusStyles[status])}>
      <div className="flex gap-6 items-center">
        <div className="text-sm font-bold text-slate-400 w-20">{time}</div>
        <div>
          <div className="text-sm font-bold text-slate-900">{name}</div>
          <div className="text-[11px] text-slate-500 font-medium">{reason} • {type}</div>
        </div>
      </div>
      <button className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-blue-600 shadow-sm transition-all">
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

function InsightItem({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-lg font-bold text-slate-900 tracking-tight">{value}</span>
    </div>
  );
}

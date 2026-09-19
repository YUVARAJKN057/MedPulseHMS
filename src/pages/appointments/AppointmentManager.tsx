import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, 
  MapPin, Plus, CheckCircle2, XCircle, AlertCircle, Video, X, Bell, Send
} from 'lucide-react';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';
import { getAppointments, getStaff, createAppointment, createNotification } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import NotificationCenter from '../../components/common/NotificationCenter';

export default function AppointmentManager() {
  const { user } = useAuth();
  const [activeDate, setActiveDate] = useState('Today');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    doctorId: '',
    doctorName: '',
    date: '',
    time: '',
    type: 'General Consultation',
    urgent: false
  });

  useEffect(() => {
    if (!user) return;

    const unsubscribe = getAppointments((data) => {
      setAppointments(data);
      setLoading(false);
    }, user.role, user.uid);

    const unsubscribeStaff = getStaff((data) => {
      setDoctors(data.filter(d => d.role === 'doctor'));
    });

    return () => {
      unsubscribe();
      unsubscribeStaff();
    };
  }, [user]);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
      await createAppointment({
        ...formData,
        doctorName: selectedDoctor?.name || 'Dr. Unknown',
        patientId: user?.role === 'patient' ? user.uid : formData.patientId,
        patientName: user?.role === 'patient' ? user.displayName : formData.patientName,
      });
      toast.success('Appointment scheduled successfully');
      setIsScheduleModalOpen(false);
    } catch (error) {
      toast.error('Failed to schedule appointment');
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    // Basic filter for now, can be extended for date range
    if (activeDate === 'Upcoming') return apt.status === 'pending' || apt.status === 'scheduled';
    return true; 
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <NotificationCenter />
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Visit Management</h1>
            <p className="text-slate-500">Monitor and organize all medical consultations.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsScheduleModalOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
        >
          <CalendarIcon size={18} />
          Schedule Visit
        </button>
      </header>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Timeline Control */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">May 2026</h3>
              <div className="flex gap-1">
                <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><ChevronLeft size={18} /></button>
                <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><ChevronRight size={18} /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-2">{d}</div>
              ))}
              {Array.from({ length: 31 }).map((_, i) => (
                <button 
                  key={i} 
                  className={cn(
                    "h-8 w-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all",
                    i + 1 === 15 ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
            <h3 className="text-lg font-bold mb-4 relative z-10">Queue Overview</h3>
            <div className="space-y-4 relative z-10">
              <QueueStat label="In Progress" count={appointments.filter(a => a.status === 'in-progress').length.toString()} color="bg-blue-500" />
              <QueueStat label="Waiting" count={appointments.filter(a => a.status === 'pending').length.toString()} color="bg-orange-500" />
              <QueueStat label="Emergency" count={appointments.filter(a => a.urgent).length.toString()} color="bg-red-500" />
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px]" />
          </div>
        </div>

        {/* Appointments List */}
        <div className="lg:col-span-9 space-y-6">
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 self-start shadow-sm w-fit">
            <button 
              onClick={() => setActiveDate('Today')}
              className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", activeDate === 'Today' ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-900")}
            >Today</button>
            <button 
              onClick={() => setActiveDate('Tomorrow')}
              className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", activeDate === 'Tomorrow' ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-900")}
            >Tomorrow</button>
            <button 
              onClick={() => setActiveDate('Upcoming')}
              className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", activeDate === 'Upcoming' ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-900")}
            >Upcoming</button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="p-12 text-center text-slate-400">Loading visits...</div>
            ) : filteredAppointments.length > 0 ? (
              filteredAppointments.map((apt: any) => (
                <AppointmentCard 
                  key={apt.id}
                  apt={apt}
                  patient={apt.patientName} 
                  doctor={apt.doctorName} 
                  time={apt.time} 
                  type={apt.type} 
                  status={apt.status}
                  urgent={apt.urgent}
                  role={user?.role}
                />
              ))
            ) : (
              <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400">
                No visits found for the selected period.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      <AnimatePresence>
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsScheduleModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl p-8 overflow-hidden"
            >
              <button 
                onClick={() => setIsScheduleModalOpen(false)}
                className="absolute right-6 top-6 p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-bold text-slate-900 mb-6">Schedule Medical Round</h2>
              
              <form onSubmit={handleSchedule} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {user?.role !== 'patient' && (
                    <div className="space-y-2 col-span-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Patient Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.patientName}
                        onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Select Doctor</label>
                    <select 
                      required
                      value={formData.doctorId}
                      onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:outline-none"
                    >
                      <option value="">Choose a specialist</option>
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.department || 'General'})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Visit Type</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:outline-none"
                    >
                      <option>General Consultation</option>
                      <option>Cardiac Review</option>
                      <option>Lab Tests</option>
                      <option>Surgery Prep</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Date</label>
                    <input 
                      required
                      type="date" 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Time</label>
                    <input 
                      required
                      type="time" 
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:outline-none"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={formData.urgent}
                    onChange={(e) => setFormData({...formData, urgent: e.target.checked})}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                  />
                  <span className="text-sm font-bold text-slate-700">Mark as Emergency/Urgent Round</span>
                </label>

                <button 
                  type="submit"
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                >
                  Confirm Appointment
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QueueStat({ label, count, color }: { label: string, count: string, color: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={cn("w-2 h-2 rounded-full", color)} />
        <span className="text-sm font-medium text-slate-400">{label}</span>
      </div>
      <span className="text-lg font-bold">{count}</span>
    </div>
  );
}

function AppointmentCard({ apt, patient, doctor, time, type, status, urgent, role }: any) {
  const statusConfig: any = {
    scheduled: { color: 'text-blue-600', bg: 'bg-blue-50', icon: <Clock size={16} />, label: 'Scheduled' },
    waiting: { color: 'text-orange-600', bg: 'bg-orange-50', icon: <AlertCircle size={16} />, label: 'In Queue' },
    pending: { color: 'text-orange-600', bg: 'bg-orange-50', icon: <AlertCircle size={16} />, label: 'In Queue' },
    completed: { color: 'text-green-600', bg: 'bg-green-50', icon: <CheckCircle2 size={16} />, label: 'Completed' },
  };
  
  const currentStatus = statusConfig[status] || statusConfig.scheduled;

  const handleNotifyPatient = async () => {
    if (!apt.patientId) {
      toast.error('Patient record not found');
      return;
    }
    try {
      await createNotification(
        apt.patientId, 
        'Visit Reminder', 
        `Your appointment with ${doctor} is scheduled for ${time}. Please be on time.`,
        'info'
      );
      toast.success('Patient notified');
    } catch (err) {
      toast.error('Failed to notify');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white p-8 rounded-[2.5rem] border border-slate-200 group transition-all hover:shadow-2xl hover:shadow-slate-200/50 flex flex-col md:flex-row md:items-center justify-between gap-6",
        urgent && "ring-2 ring-red-500/20 border-red-100"
      )}
    >
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
          <Clock size={24} />
          <span className="text-[10px] font-bold mt-1">{time}</span>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-slate-900">{patient}</h3>
            {urgent && (
              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[8px] font-black uppercase tracking-tighter rounded border border-red-200">
                Urgent
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
            <span>{doctor}</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span>{type}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className={cn("px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest", currentStatus.bg, currentStatus.color)}>
          {currentStatus.icon}
          {currentStatus.label}
        </div>
        <div className="h-8 w-px bg-slate-100" />
        <div className="flex gap-2">
          {role === 'receptionist' && (
            <button 
              onClick={handleNotifyPatient}
              className="p-3 bg-blue-50 text-blue-400 hover:text-blue-600 rounded-xl hover:bg-blue-100 transition-all" title="Notify Patient">
              <Send size={20} />
            </button>
          )}
          <button className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all" title="Video Call">
            <Video size={20} />
          </button>
          <button 
            onClick={() => toast.success('Entry confirmed')}
            className="p-3 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-200 hover:bg-slate-800 active:scale-[0.98] transition-all"
          >
            <CheckCircle2 size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}


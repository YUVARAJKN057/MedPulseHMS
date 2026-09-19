import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Calendar, Clock, Plus, Search, 
  MoreHorizontal, Phone, Mail, CheckCircle2, AlertCircle,
  Bell, Send, UserRound, ArrowUpRight, X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { getAppointments, getNotifications, createNotification, getStaff } from '../../services/firestoreService';
import NotificationCenter from '../../components/common/NotificationCenter';
import toast from 'react-hot-toast';

export default function ReceptionistDashboard() {
  const { user } = useAuth();
  const [activeQueue, setActiveQueue] = useState('all');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Seed notifications for receptionist
    const checkAndSeedNotifs = async () => {
      const unsubscribeNotifs = getNotifications(async (notifs) => {
        if (notifs.length === 0) {
          await createNotification(user.uid, 'Welcome to Reception HQ', 'Monitor the live queue and coordinate patient arrivals.', 'info');
          await createNotification(user.uid, 'System Alert', 'New schedule for Cardiology for upcoming week is posted.', 'warning');
        }
        unsubscribeNotifs();
      }, user.uid);
    };
    checkAndSeedNotifs();

    const unsubscribeStaff = getStaff((data) => {
      setDoctors(data.filter(d => d.role === 'doctor'));
    });

    const unsubscribeAppts = getAppointments((data) => {
      setAppointments(data);
      setLoading(false);
    }, 'receptionist', user.uid);

    return () => {
      unsubscribeStaff();
      unsubscribeAppts();
    };
  }, [user]);

  const handleNotifyPatient = async (patientId: string, patientName: string, doctorName: string, time: string) => {
    if (!patientId) {
       toast.error('Patient ID not found');
       return;
    }
    try {
      await createNotification(
        patientId, 
        'Ready for Consultation', 
        `Hi ${patientName}, Dr. ${doctorName} is ready to see you at ${time}. Please proceed to the cabin.`,
        'success'
      );
      toast.success(`Notification sent to ${patientName}`);
    } catch (err) {
      toast.error('Failed to send notification');
    }
  };

  const handleSendCustomMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !customMessage) return;
    try {
      await createNotification(selectedPatient.patientId, 'Message from Reception', customMessage, 'info');
      toast.success('Message delivered');
      setIsMessageModalOpen(false);
      setCustomMessage('');
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <NotificationCenter />
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Reception Hub</h1>
            <p className="text-slate-500">Managing patient arrivals and check-ins.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
            <Search size={18} />
            Find Patient
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
            <Plus size={18} />
            Quick Register
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Registration Quick Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Daily Traffic</h3>
            <div className="space-y-6">
              <TrafficStat label="Check-ins" value="128" color="text-blue-600" />
              <TrafficStat label="New Patients" value="14" color="text-green-600" />
              <TrafficStat label="Emergency" value="3" color="text-red-600" />
            </div>
          </div>

          {/* Specialist Timings Section */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Specialist Schedules</h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {doctors.map(doc => (
                <div key={doc.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xs">
                    {doc.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 leading-tight">{doc.name}</div>
                    <div className="text-[10px] text-blue-600 font-bold uppercase">{doc.department || 'General'}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Avail: 09:00 - 17:00</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden">
            <h3 className="text-lg font-bold mb-4 relative z-10">Facility Link</h3>
            <p className="text-slate-400 text-xs mb-6 relative z-10">Broadcast announcements to all patient displays.</p>
            <button className="w-full py-3 bg-white/10 border border-white/10 rounded-2xl text-sm font-bold hover:bg-white/20 transition-all relative z-10">
              Send Alert
            </button>
            <AlertCircle className="absolute -bottom-4 -right-4 text-white/5" size={120} />
          </div>
        </div>

        {/* Live Queue Management */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-slate-900">Current Queue</h3>
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 scale-90">
                  <button 
                    onClick={() => setActiveQueue('all')}
                    className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", activeQueue === 'all' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900")}
                  >All</button>
                  <button 
                    onClick={() => setActiveQueue('waiting')}
                    className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", activeQueue === 'waiting' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900")}
                  >Waiting</button>
                </div>
              </div>
              <div className="text-xs font-bold text-slate-400 flex items-center gap-2">
                <Clock size={14} />
                Live Status
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-slate-400 font-bold border-b border-slate-100">
                    <th className="px-8 py-4">Patient</th>
                    <th className="px-8 py-4">Arrival</th>
                    <th className="px-8 py-4">Doctor</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.length > 0 ? (
                    appointments.map(apt => (
                      <QueueRow 
                        key={apt.id}
                        id={apt.id}
                        patientId={apt.patientId}
                        name={apt.patientName} 
                        time={apt.time} 
                        doctor={apt.doctorName} 
                        status={apt.status === 'pending' ? 'Waiting' : apt.status} 
                        avatar={apt.patientName.charAt(0)}
                        onNotify={() => {
                          setSelectedPatient(apt);
                          setIsMessageModalOpen(true);
                        }}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center text-slate-300">No active queue at the moment.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Message Modal */}
      <AnimatePresence>
        {isMessageModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMessageModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl p-8 overflow-hidden"
            >
              <button onClick={() => setIsMessageModalOpen(false)} className="absolute right-6 top-6 p-2 text-slate-400 hover:bg-slate-100 rounded-xl"><X size={20} /></button>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">Message Patient</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">To: {selectedPatient?.patientName}</p>
                </div>
              </div>

              <form onSubmit={handleSendCustomMessage} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Message</label>
                   <textarea 
                    autoFocus
                    required
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Enter appointment update, room number, or special instructions..."
                    className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-600/5 transition-all h-32 resize-none"
                   />
                </div>

                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => {
                      setCustomMessage(`Hi ${selectedPatient?.patientName}, Dr. ${selectedPatient?.doctorName} is ready to see you at ${selectedPatient?.time}. Please proceed to Cabin ${Math.floor(Math.random() * 10) + 1}.`);
                    }}
                    className="flex-1 py-3 px-4 bg-slate-50 text-slate-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
                  >
                    Use Template
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Send size={18} />
                    Send Notification
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


function TrafficStat({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex items-center justify-between group cursor-default">
      <div>
        <div className="text-xs font-bold text-slate-400 transition-colors group-hover:text-slate-600">{label}</div>
        <div className={cn("text-2xl font-bold tracking-tight", color)}>{value}</div>
      </div>
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-slate-100 transition-all">
        <ArrowUpRight size={18} />
      </div>
    </div>
  );
}

function QueueRow({ id, name, time, doctor, status, avatar, onNotify }: any) {
  const statusStyles: any = {
    'Waiting': 'bg-orange-50 text-orange-600',
    'Pending': 'bg-orange-50 text-orange-600',
    'Check-in': 'bg-blue-50 text-blue-600',
    'Scheduled': 'bg-blue-50 text-blue-600',
    'Completed': 'bg-green-50 text-green-600',
    'In Service': 'bg-emerald-50 text-emerald-600',
  };
  
  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-xs font-bold text-slate-500 shadow-sm">
            {avatar}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{name}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase flex gap-2">
              <Phone size={10} /> Contact
            </div>
          </div>
        </div>
      </td>
      <td className="px-8 py-5 text-sm font-medium text-slate-500">{time}</td>
      <td className="px-8 py-5 text-sm font-bold text-slate-700">{doctor}</td>
      <td className="px-8 py-5">
        <span className={cn("text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full", statusStyles[status] || 'bg-slate-100')}>
          {status}
        </span>
      </td>
      <td className="px-8 py-5">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={onNotify}
            className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all" title="Notify Patient">
            <Send size={18} />
          </button>
          <button className="p-2 hover:bg-green-50 text-slate-400 hover:text-green-600 rounded-xl transition-all" title="Mark Present">
            <CheckCircle2 size={18} />
          </button>
          <button className="p-2 hover:bg-white text-slate-400 hover:text-slate-900 rounded-xl shadow-sm transition-all">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}

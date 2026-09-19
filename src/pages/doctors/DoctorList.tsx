import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Filter, UserRound, ArrowUpRight, Mail, Phone, Calendar, X, Clock, CheckCircle2 } from 'lucide-react';
import { getStaff, createStaff, createAppointment } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function DoctorList() {
  const { user, profile } = useAuth();
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  // Form State for adding staff
  const [formData, setFormData] = useState({
    name: '',
    role: 'doctor',
    email: '',
    phone: '',
    department: '',
    specialization: ''
  });

  useEffect(() => {
    const unsubscribe = getStaff(async (data) => {
      if (data.length === 0 && !loading) {
        // Seed some initial doctors if none exist (only once)
        const seedDoctors = [
          { name: 'Dr. Sarah Jenkins', role: 'doctor', email: 'sarah.j@medpulse.com', phone: '+1 (555) 123-4567', department: 'Neurology', specialization: 'Brain Mapping' },
          { name: 'Dr. Michael Chen', role: 'doctor', email: 'm.chen@medpulse.com', phone: '+1 (555) 987-6543', department: 'Cardiology', specialization: 'Heart Surgery' },
          { name: 'Dr. Elena Rodriguez', role: 'doctor', email: 'elena.r@medpulse.com', phone: '+1 (555) 456-7890', department: 'Pediatrics', specialization: 'Child Health' }
        ];
        for (const doc of seedDoctors) {
          await createStaff(doc);
        }
      }
      setStaff(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [loading]);

  const filteredStaff = staff.filter(member => {
    const matchesSearch = 
      member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.specialization?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStaff(formData);
      toast.success('Staff member added successfully');
      setIsAddModalOpen(false);
    } catch (error) {
      toast.error('Failed to add staff member');
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Staff Management</h1>
          <p className="text-slate-500">Manage hospital specialists and their schedules.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
        >
          <Plus size={18} />
          Add New Specialist
        </button>
      </header>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm min-h-[500px]">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, specialization or department..." 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-12 text-center text-slate-400">Fetching hospital staff...</div>
          ) : filteredStaff.length > 0 ? (
            filteredStaff.map(member => (
              <DoctorCard 
                key={member.id}
                name={member.name} 
                specialty={member.specialization || member.role} 
                dept={member.department || 'General'}
                email={member.email}
                phone={member.phone}
                avatar={member.name?.charAt(member.name.startsWith('Dr. ') ? 4 : 0) || 'U'}
                onBook={() => setSelectedDoctor(member)}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-400">No staff members matching your search.</div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedDoctor && (
          <BookAppointmentModal 
            doctor={selectedDoctor} 
            onClose={() => setSelectedDoctor(null)} 
            patientId={user?.uid}
            patientName={profile?.name || user?.displayName || user?.email}
          />
        )}
      </AnimatePresence>

      {/* Add Staff Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl p-8 overflow-hidden"
            >
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute right-6 top-6 p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-bold text-slate-900 mb-6">Add Specialist</h2>
              
              <form onSubmit={handleAddStaff} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:outline-none"
                      placeholder="Dr. John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Role</label>
                    <select 
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:outline-none"
                    >
                      <option value="doctor">Doctor</option>
                      <option value="nurse">Nurse</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Department</label>
                    <input 
                      required
                      type="text" 
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:outline-none"
                      placeholder="e.g. Cardiology"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                    <input 
                      required
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:outline-none"
                      placeholder="doctor@medpulse.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Phone</label>
                    <input 
                      required
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:outline-none"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Specialization</label>
                    <input 
                      type="text" 
                      value={formData.specialization}
                      onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:outline-none"
                      placeholder="e.g. Heart Surgery"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
                >
                  Confirm and Add Staff
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DoctorCard({ name, specialty, dept, email, phone, avatar, onBook }: any) {
  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100/50 group cursor-pointer hover:bg-white hover:border-blue-200 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center font-bold text-xl text-blue-600 shadow-sm border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
          {avatar}
        </div>
        <button onClick={onBook} className="p-2 hover:bg-slate-100 rounded-xl text-slate-300 hover:text-slate-900 transition-all active:scale-90">
          <ArrowUpRight size={20} />
        </button>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{name}</h3>
        <p className="text-sm font-bold text-blue-600/70 uppercase tracking-widest">{specialty}</p>
        <p className="text-xs text-slate-400 font-medium">{dept}</p>
      </div>

      <div className="space-y-3 pt-6 border-t border-slate-200/50">
        <div className="flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-colors">
          <Mail size={16} />
          <span className="text-xs font-semibold">{email}</span>
        </div>
        <div className="flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-colors">
          <Phone size={16} />
          <span className="text-xs font-semibold">{phone}</span>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBook}
          className="flex-1 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold hover:bg-slate-900 hover:text-white transition-all shadow-sm"
        >
          Schedule
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold hover:bg-slate-900 hover:text-white transition-all shadow-sm"
        >
          Profile
        </motion.button>
      </div>
    </motion.div>
  );
}

function BookAppointmentModal({ doctor, onClose, patientId, patientName }: any) {
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '10:00 AM',
    type: 'Consultation',
    notes: ''
  });

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      toast.error('Please sign in as a patient to book');
      return;
    }
    setLoading(true);
    try {
      await createAppointment({
        ...bookingData,
        doctorId: doctor.id,
        doctorName: doctor.name,
        patientId,
        patientName: patientName || 'Anonymous Patient',
      });
      toast.success(`Visit booked with ${doctor.name}!`);
      onClose();
    } catch (e) {
      toast.error('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl p-8 md:p-10"
      >
        <button onClick={onClose} className="absolute right-6 top-6 p-2 text-slate-400 hover:bg-slate-100 rounded-xl"><X size={20} /></button>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-2xl font-bold">
            {doctor.name.charAt(doctor.name.startsWith('Dr. ') ? 4 : 0)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{doctor.name}</h3>
            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">{doctor.specialization || doctor.department}</p>
          </div>
        </div>

        <form onSubmit={handleBooking} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Appointment Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="date" 
                required
                min={new Date().toISOString().split('T')[0]}
                value={bookingData.date}
                onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-blue-600/5 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Time Slot</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select 
                  value={bookingData.time}
                  onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none"
                >
                  <option>09:00 AM</option>
                  <option>10:00 AM</option>
                  <option>11:00 AM</option>
                  <option>02:00 PM</option>
                  <option>04:00 PM</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Visit Type</label>
              <select 
                value={bookingData.type}
                onChange={(e) => setBookingData({...bookingData, type: e.target.value})}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none"
              >
                <option>Consultation</option>
                <option>Follow-up</option>
                <option>Check-up</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Additional Notes</label>
            <textarea 
              value={bookingData.notes}
              onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
              placeholder="Any specific concerns..."
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none h-24 resize-none"
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <div className="animate-spin h-6 w-6 border-4 border-white/30 border-t-white rounded-full" /> : (
              <>
                <CheckCircle2 size={24} />
                Reserve Now
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

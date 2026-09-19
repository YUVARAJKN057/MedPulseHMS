import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, FileText, ChevronRight, Activity, Calendar, Download, Trash2, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { getMedicalRecords, getPatients, createMedicalRecord } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function MedicalRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    diagnosis: '',
    notes: '',
    attachments: 0
  });

  useEffect(() => {
    if (!user) return;
    const unsubscribe = getMedicalRecords((data) => {
      setRecords(data);
      setLoading(false);
    }, user.role, user.uid);

    const unsubscribePatients = getPatients((data) => {
      setPatients(data);
    });

    return () => {
      unsubscribe();
      unsubscribePatients();
    };
  }, [user]);

  const filteredRecords = records.filter(record => {
    const search = searchQuery.toLowerCase();
    return (
      record.patientName?.toLowerCase().includes(search) ||
      record.diagnosis?.toLowerCase().includes(search)
    );
  });

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const patient = patients.find(p => p.id === formData.patientId);
      await createMedicalRecord({
        ...formData,
        patientName: patient?.name || formData.patientName,
        doctorId: user?.uid,
        doctorName: user?.displayName
      });
      toast.success('Clinical entry created');
      setIsAddModalOpen(false);
    } catch (error) {
      toast.error('Failed to create entry');
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Clinical Repository</h1>
          <p className="text-slate-500">Secure access to patient medical histories and diagnostic files.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
        >
          <Plus size={18} />
          New Clinical Entry
        </button>
      </header>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient name, diagnosis or prescription..." 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600"
            />
          </div>
        </div>

        <div className="space-y-6">
          <RecordCategory title="Clinical Entries" count={filteredRecords.length} color="blue" />
          
          <div className="grid lg:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-full py-12 text-center text-slate-400">Syncing with medical vault...</div>
            ) : filteredRecords.length > 0 ? (
              filteredRecords.map(record => (
                <RecordCard 
                  key={record.id}
                  patient={record.patientName} 
                  doctor={record.doctorName} 
                  date={record.createdAt ? new Date(record.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'} 
                  diagnosis={record.diagnosis} 
                  attachments={record.attachments || 0}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-400">No clinical entries found.</div>
            )}
          </div>
        </div>
      </div>

      {/* Add Record Modal */}
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

              <h2 className="text-2xl font-bold text-slate-900 mb-6">Create Clinical Entry</h2>
              
              <form onSubmit={handleCreateRecord} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Select Patient</label>
                    <select 
                      required
                      value={formData.patientId}
                      onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:outline-none"
                    >
                      <option value="">Choose patient</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Diagnosis</label>
                    <input 
                      required
                      type="text" 
                      value={formData.diagnosis}
                      onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:outline-none"
                      placeholder="e.g. Type 2 Diabetes"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Clinical Notes</label>
                    <textarea 
                      required
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:outline-none h-32 resize-none"
                      placeholder="Detailed observation..."
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                >
                  Save Entry
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RecordCategory({ title, count, color }: any) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">{title}</h3>
      <div className="flex-1 h-px bg-slate-100" />
      <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold text-white", color === 'blue' ? 'bg-blue-600' : 'bg-slate-900')}>
        {count}
      </span>
    </div>
  );
}

function RecordCard({ patient, doctor, date, diagnosis, attachments }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 bg-slate-50 border border-slate-100/50 rounded-[2rem] group hover:bg-white hover:border-blue-200 hover:shadow-2xl hover:shadow-slate-200/50 transition-all"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
          <Calendar size={14} />
          {date}
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-all shadow-sm"><Download size={16} /></button>
          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-600 transition-all shadow-sm"><Trash2 size={16} /></button>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-xl font-bold text-slate-900 mb-2 truncate group-hover:text-blue-600 transition-colors">{patient}</h4>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          <p className="text-sm font-bold text-slate-700">{diagnosis}</p>
        </div>
        <p className="text-xs text-slate-400 font-medium italic">Prepared by {doctor}</p>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-slate-200/50">
        <div className="flex items-center gap-2 text-blue-600">
          <FileText size={16} />
          <span className="text-xs font-bold">{attachments} Files Attached</span>
        </div>
        <button className="flex items-center gap-2 text-xs font-bold text-slate-900 hover:text-blue-600 transition-all uppercase tracking-widest">
          View Details
          <ChevronRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}

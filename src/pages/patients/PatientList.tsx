import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Mail, Phone, ChevronRight, Activity, Download, UserX } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getPatients, exportToCSV } from '../../services/firestoreService';
import { EmptyState } from '../../components/common/Feedback';
import toast from 'react-hot-toast';

export default function PatientList() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = getPatients((data) => {
      setPatients(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredPatients = patients.filter(p => {
    const search = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(search) ||
      p.email?.toLowerCase().includes(search) ||
      p.id?.toLowerCase().includes(search)
    );
  });

  const handleExport = () => {
    exportToCSV(patients, 'Patients_Database');
    toast.success('Patient list exported');
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Patient Directory</h1>
          <p className="text-slate-500">Access and manage all patient medical identities.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download size={18} />
            Export CSV
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
            <Plus size={18} />
            Register New Patient
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, name, email or phone..." 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
             <div className="py-20 text-center">
                <div className="inline-block w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-medium">Retrieving patient database...</p>
             </div>
          ) : filteredPatients.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400 font-bold border-b border-slate-100">
                  <th className="px-8 py-5">Patient Name</th>
                  <th className="px-8 py-5">Medical ID</th>
                  <th className="px-8 py-4 px-8">Contact</th>
                  <th className="px-8 py-5">Blood G.</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPatients.map(p => (
                  <PatientRow 
                    key={p.id}
                    name={p.name} 
                    id={p.id.slice(-8).toUpperCase()} 
                    email={p.email} 
                    phone={p.phone || 'N/A'} 
                    blood={p.bloodGroup || 'UNK'} 
                    avatar={p.name?.charAt(0) || 'P'}
                  />
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12">
               <EmptyState 
                 icon={<UserX size={40} />} 
                 title="No Patients Found" 
                 description={searchQuery ? `No matching records for "${searchQuery}"` : "The patient registry is currently empty."}
                 action={searchQuery ? (
                   <button 
                     onClick={() => setSearchQuery('')}
                     className="text-blue-600 font-bold hover:underline"
                   >
                     Clear Search
                   </button>
                 ) : undefined}
               />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PatientRow({ name, id, email, phone, blood, avatar }: any) {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors group cursor-pointer border-b border-slate-50/50">
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center font-bold text-slate-500 text-xs shadow-sm">
            {avatar}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{name}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Patient</div>
          </div>
        </div>
      </td>
      <td className="px-8 py-5">
        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">{id}</span>
      </td>
      <td className="px-8 py-5 font-medium">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Mail size={12} /> {email}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Phone size={12} /> {phone}
          </div>
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="flex items-center gap-2 text-sm font-bold text-red-600">
          <Activity size={14} />
          {blood}
        </div>
      </td>
      <td className="px-8 py-5 text-right">
        <button className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-blue-600 transition-all shadow-sm opacity-0 group-hover:opacity-100">
          <ChevronRight size={18} />
        </button>
      </td>
    </tr>
  );
}

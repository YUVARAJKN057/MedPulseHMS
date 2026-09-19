import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Hotel, Search, Filter, Plus, UserPlus, 
  Trash2, RefreshCw, CheckCircle2, AlertCircle, 
  Clock, Thermometer, ShieldCheck, X, BellPlus, TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  getBeds, updateBedStatus, createBed, deleteBed, getPatients,
  createBedSubscription, findRelevantSubscriptions, createNotification, getBedSubscriptions, deleteBedSubscription,
  createBedRequest, getBedRequests, updateBedRequestStatus
} from '../../services/firestoreService';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  vacant: 'bg-green-100 text-green-700 border-green-200',
  occupied: 'bg-blue-100 text-blue-700 border-blue-200',
  cleaning: 'bg-amber-100 text-amber-700 border-amber-200',
  maintenance: 'bg-red-100 text-red-700 border-red-200',
};

export default function BedManagement() {
  const { user, profile } = useAuth();
  const [beds, setBeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [wardFilter, setWardFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedBed, setSelectedBed] = useState<any>(null);
  const [mySubscriptions, setMySubscriptions] = useState<any[]>([]);
  const [bedRequests, setBedRequests] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [view, setView] = useState<'grid' | 'history' | 'requests'>('grid');
  
  const seedAttempted = React.useRef(false);
  const requestsSeedAttempted = React.useRef(false);

  useEffect(() => {
    if (!user) return;
    const unsubscribeSubs = getBedSubscriptions(user.uid, (data) => {
      setMySubscriptions(data);
    });
    
    let unsubscribeHistory = () => {};
    if (profile?.role === 'admin' || profile?.role === 'receptionist' || profile?.role === 'doctor') {
      import('../../services/firestoreService').then(service => {
        unsubscribeHistory = service.getBedHistory((data) => setHistory(data));
      });
    }

    let unsubscribeRequests = () => {};
    if (profile?.role === 'patient') {
      unsubscribeRequests = getBedRequests((data) => setBedRequests(data), user.uid);
    } else if (profile?.role && profile.role !== 'patient') {
      unsubscribeRequests = getBedRequests((data) => {
        const canSeed = profile?.role === 'admin' || profile?.role === 'receptionist';
        if (data.length === 0 && canSeed && !requestsSeedAttempted.current) {
          requestsSeedAttempted.current = true;
          const initialRequests = [
            { patientName: 'Alice Hamilton', userId: 'demo-req-1', bedType: 'General', preferredWard: 'Floor 1 - East', reason: 'Post-surgery recovery', status: 'pending', createdAt: new Date() },
            { patientName: 'Bob Vance', userId: 'demo-req-2', bedType: 'ICU', preferredWard: 'Critical Care', reason: 'Acute respiratory distress', status: 'pending', createdAt: new Date() },
            { patientName: 'Charlie Root', userId: 'demo-req-3', bedType: 'Pediatric', preferredWard: 'Pediatric Wing', reason: 'High fever and dehydration', status: 'accepted', createdAt: new Date() },
            { patientName: 'Diana Prince', userId: 'demo-req-4', bedType: 'Emergency', preferredWard: 'Emergency', reason: 'Severe allergic reaction', status: 'pending', createdAt: new Date() },
            { patientName: 'Frank Castle', userId: 'demo-req-5', bedType: 'Emergency', preferredWard: 'Emergency', reason: 'Tactical injuries', status: 'pending', createdAt: new Date() },
            { patientName: 'Peter Parker', userId: 'demo-req-6', bedType: 'General', preferredWard: 'Floor 1 - East', reason: 'Experimental spider bite', status: 'pending', createdAt: new Date() },
            { patientName: 'Bruce Wayne', userId: 'demo-req-7', bedType: 'ICU', preferredWard: 'Critical Care', reason: 'Acute exhaustion and rib fractures', status: 'pending', createdAt: new Date() },
            { patientName: 'Selina Kyle', userId: 'demo-req-8', bedType: 'General', preferredWard: 'Floor 1 - East', reason: 'Laceration repair', status: 'pending', createdAt: new Date() },
            { patientName: 'Alice Hamilton', userId: 'demo-req-9', bedType: 'General', preferredWard: 'Floor 1 - East', reason: 'Follow-up consultation', status: 'pending', createdAt: new Date() },
          ];
          initialRequests.forEach(req => createBedRequest(req));
        }
        setBedRequests(data);
      });
    }

    return () => {
      unsubscribeSubs();
      unsubscribeHistory();
      unsubscribeRequests();
    };
  }, [user, profile]);

  useEffect(() => {
    const unsubscribe = getBeds((data) => {
      // Seed initial beds if none exist - Restricted to admin/receptionist
      const canSeed = profile?.role === 'admin' || profile?.role === 'receptionist';
      if (data.length === 0 && !seedAttempted.current && canSeed) {
        seedAttempted.current = true;
        const initialBeds = [
          // Floor 1 - East (General Medicine) - 10 beds
          { number: '101', ward: 'Floor 1 - East', department: 'General Medicine', type: 'General', status: 'vacant' },
          { number: '102', ward: 'Floor 1 - East', department: 'General Medicine', type: 'General', status: 'occupied', patientName: 'John Doe', patientId: 'demo-1' },
          { number: '103', ward: 'Floor 1 - East', department: 'General Medicine', type: 'General', status: 'vacant' },
          { number: '104', ward: 'Floor 1 - East', department: 'General Medicine', type: 'General', status: 'maintenance' },
          { number: '105', ward: 'Floor 1 - East', department: 'General Medicine', type: 'General', status: 'occupied', patientName: 'Jane Smith', patientId: 'demo-p-1' },
          { number: '106', ward: 'Floor 1 - East', department: 'General Medicine', type: 'General', status: 'vacant' },
          { number: '107', ward: 'Floor 1 - East', department: 'General Medicine', type: 'General', status: 'vacant' },
          { number: '108', ward: 'Floor 1 - East', department: 'General Medicine', type: 'General', status: 'occupied', patientName: 'Nate Fisher', patientId: 'demo-p-7' },
          { number: '109', ward: 'Floor 1 - East', department: 'General Medicine', type: 'General', status: 'cleaning' },
          { number: '110', ward: 'Floor 1 - East', department: 'General Medicine', type: 'General', status: 'occupied', patientName: 'Michael Corleone', patientId: 'p-10' },

          // Critical Care (ICU) - 10 beds
          { number: 'ICU-01', ward: 'Critical Care', department: 'ICU', type: 'ICU', status: 'vacant' },
          { number: 'ICU-02', ward: 'Critical Care', department: 'ICU', type: 'ICU', status: 'occupied', patientName: 'Sarah Smith', patientId: 'demo-2' },
          { number: 'ICU-03', ward: 'Critical Care', department: 'ICU', type: 'ICU', status: 'cleaning' },
          { number: 'ICU-04', ward: 'Critical Care', department: 'ICU', type: 'ICU', status: 'occupied', patientName: 'Robert Brown', patientId: 'demo-p-2' },
          { number: 'ICU-05', ward: 'Critical Care', department: 'ICU', type: 'ICU', status: 'vacant' },
          { number: 'ICU-06', ward: 'Critical Care', department: 'ICU', type: 'ICU', status: 'occupied', patientName: 'Gregory House', patientId: 'demo-p-8' },
          { number: 'ICU-07', ward: 'Critical Care', department: 'ICU', type: 'ICU', status: 'maintenance' },
          { number: 'ICU-08', ward: 'Critical Care', department: 'ICU', type: 'ICU', status: 'occupied', patientName: 'Walter White', patientId: 'p-11' },
          { number: 'ICU-09', ward: 'Critical Care', department: 'ICU', type: 'ICU', status: 'occupied', patientName: 'Jesse Pinkman', patientId: 'p-12' },
          { number: 'ICU-10', ward: 'Critical Care', department: 'ICU', type: 'ICU', status: 'vacant' },

          // Pediatric Wing - 8 beds
          { number: 'P-01', ward: 'Pediatric Wing', department: 'Pediatrics', type: 'Pediatric', status: 'vacant' },
          { number: 'P-02', ward: 'Pediatric Wing', department: 'Pediatrics', type: 'Pediatric', status: 'occupied', patientName: 'Timmy Jones', patientId: 'demo-3' },
          { number: 'P-03', ward: 'Pediatric Wing', department: 'Pediatrics', type: 'Pediatric', status: 'vacant' },
          { number: 'P-04', ward: 'Pediatric Wing', department: 'Pediatrics', type: 'Pediatric', status: 'occupied', patientName: 'Lucy White', patientId: 'demo-p-4' },
          { number: 'P-05', ward: 'Pediatric Wing', department: 'Pediatrics', type: 'Pediatric', status: 'occupied', patientName: 'Billy Batson', patientId: 'p-13' },
          { number: 'P-06', ward: 'Pediatric Wing', department: 'Pediatrics', type: 'Pediatric', status: 'occupied', patientName: 'Miles Morales', patientId: 'p-14' },
          { number: 'P-07', ward: 'Pediatric Wing', department: 'Pediatrics', type: 'Pediatric', status: 'vacant' },
          { number: 'P-08', ward: 'Pediatric Wing', department: 'Pediatrics', type: 'Pediatric', status: 'vacant' },

          // Emergency - 9 beds
          { number: 'ER-01', ward: 'Emergency', department: 'Emergency', type: 'Emergency', status: 'occupied', patientName: 'Arthur Morgan', patientId: 'p-15' },
          { number: 'ER-02', ward: 'Emergency', department: 'Emergency', type: 'Emergency', status: 'occupied', patientName: 'Mike Ross', patientId: 'demo-4' },
          { number: 'ER-03', ward: 'Emergency', department: 'Emergency', type: 'Emergency', status: 'cleaning' },
          { number: 'ER-04', ward: 'Emergency', department: 'Emergency', type: 'Emergency', status: 'occupied', patientName: 'Harvey Specter', patientId: 'demo-p-5' },
          { number: 'ER-05', ward: 'Emergency', department: 'Emergency', type: 'Emergency', status: 'vacant' },
          { number: 'ER-06', ward: 'Emergency', department: 'Emergency', type: 'Emergency', status: 'vacant' },
          { number: 'ER-07', ward: 'Emergency', department: 'Emergency', type: 'Emergency', status: 'occupied', patientName: 'Donna Paulsen', patientId: 'demo-p-9' },
          { number: 'ER-08', ward: 'Emergency', department: 'Emergency', type: 'Emergency', status: 'occupied', patientName: 'Logan Howlett', patientId: 'p-16' },
          { number: 'ER-09', ward: 'Emergency', department: 'Emergency', type: 'Emergency', status: 'occupied', patientName: 'Steve Rogers', patientId: 'p-17' },

          // Floor 2 - West (Orthopedics) - 8 beds
          { number: '201', ward: 'Floor 2 - West', department: 'Orthopedics', type: 'General', status: 'vacant' },
          { number: '202', ward: 'Floor 2 - West', department: 'Orthopedics', type: 'General', status: 'occupied', patientName: 'Tony Stark', patientId: 'demo-stark' },
          { number: '203', ward: 'Floor 2 - West', department: 'Orthopedics', type: 'General', status: 'occupied', patientName: 'Thor Odinson', patientId: 'p-18' },
          { number: '204', ward: 'Floor 2 - West', department: 'Orthopedics', type: 'General', status: 'vacant' },
          { number: '205', ward: 'Floor 2 - West', department: 'Orthopedics', type: 'General', status: 'maintenance' },
          { number: '206', ward: 'Floor 2 - West', department: 'Orthopedics', type: 'General', status: 'occupied', patientName: 'Clint Barton', patientId: 'p-19' },
          { number: '207', ward: 'Floor 2 - West', department: 'Orthopedics', type: 'General', status: 'occupied', patientName: 'Natasha Romanoff', patientId: 'p-20' },
          { number: '208', ward: 'Floor 2 - West', department: 'Orthopedics', type: 'General', status: 'vacant' },

          // Maternity - 5 beds
          { number: 'M-01', ward: 'Maternity', department: 'Obstetrics', type: 'General', status: 'occupied', patientName: 'Wanda Maximoff', patientId: 'p-21' },
          { number: 'M-02', ward: 'Maternity', department: 'Obstetrics', type: 'General', status: 'occupied', patientName: 'Anna Taylor', patientId: 'demo-p-3' },
          { number: 'M-03', ward: 'Maternity', department: 'Obstetrics', type: 'General', status: 'vacant' },
          { number: 'M-04', ward: 'Maternity', department: 'Obstetrics', type: 'General', status: 'vacant' },
          { number: 'M-05', ward: 'Maternity', department: 'Obstetrics', type: 'General', status: 'occupied', patientName: 'Pepper Potts', patientId: 'p-22' },

          // Cardiology - 5 beds
          { number: 'C-01', ward: 'Cardiology', department: 'Cardiovascular', type: 'ICU', status: 'occupied', patientName: 'Stephen Strange', patientId: 'p-23' },
          { number: 'C-02', ward: 'Cardiology', department: 'Cardiovascular', type: 'General', status: 'vacant' },
          { number: 'C-03', ward: 'Cardiology', department: 'Cardiovascular', type: 'General', status: 'occupied', patientName: 'Emily Clark', patientId: 'demo-p-6' },
          { number: 'C-04', ward: 'Cardiology', department: 'Cardiovascular', type: 'General', status: 'vacant' },
          { number: 'C-05', ward: 'Cardiology', department: 'Cardiovascular', type: 'General', status: 'vacant' },

          // Oncology - 5 beds
          { number: 'ON-01', ward: 'Oncology', department: 'Internal Medicine', type: 'General', status: 'occupied', patientName: 'Charles Xavier', patientId: 'p-24' },
          { number: 'ON-02', ward: 'Oncology', department: 'Internal Medicine', type: 'General', status: 'occupied', patientName: 'Wade Wilson', patientId: 'demo-wade' },
          { number: 'ON-03', ward: 'Oncology', department: 'Internal Medicine', type: 'General', status: 'vacant' },
          { number: 'ON-04', ward: 'Oncology', department: 'Internal Medicine', type: 'General', status: 'occupied', patientName: 'Jean Grey', patientId: 'p-25' },
          { number: 'ON-05', ward: 'Oncology', department: 'Internal Medicine', type: 'General', status: 'vacant' },

          // Adding more to reach ~30 occupied and ~20 vacant
          { number: '209', ward: 'Floor 2 - West', department: 'Orthopedics', type: 'General', status: 'occupied', patientName: 'Sam Wilson', patientId: 'p-26' },
          { number: '210', ward: 'Floor 2 - West', department: 'Orthopedics', type: 'General', status: 'occupied', patientName: 'Bucky Barnes', patientId: 'p-27' },
          { number: '111', ward: 'Floor 1 - East', department: 'General Medicine', type: 'General', status: 'occupied', patientName: 'Scott Lang', patientId: 'p-28' },
          { number: '112', ward: 'Floor 1 - East', department: 'General Medicine', type: 'General', status: 'occupied', patientName: 'Hope van Dyne', patientId: 'p-29' },
          { number: 'ICU-11', ward: 'Critical Care', department: 'ICU', type: 'ICU', status: 'occupied', patientName: 'Nick Fury', patientId: 'p-30' },
          { number: '113', ward: 'Floor 1 - East', department: 'General Medicine', type: 'General', status: 'vacant' },
          { number: '114', ward: 'Floor 1 - East', department: 'General Medicine', type: 'General', status: 'vacant' },
          { number: '115', ward: 'Floor 1 - East', department: 'General Medicine', type: 'General', status: 'vacant' },
          { number: '211', ward: 'Floor 2 - West', department: 'Orthopedics', type: 'General', status: 'vacant' },
          { number: 'ON-06', ward: 'Oncology', department: 'Internal Medicine', type: 'General', status: 'vacant' },
        ];
        initialBeds.forEach(bed => createBed(bed));
      }
      setBeds(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [profile]);

  const filteredBeds = beds.filter(bed => {
    const matchesSearch = bed.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (bed.patientName && bed.patientName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesWard = wardFilter === 'All' || bed.ward === wardFilter;
    const matchesType = typeFilter === 'All' || bed.type === typeFilter;
    return matchesSearch && matchesWard && matchesType;
  });

  const wards = ['All', ...new Set(beds.length > 0 ? beds.map(b => b.ward) : ['General Ward', 'ICU', 'Emergency', 'Pediatrics', 'Maternity'])];
  const bedTypes = ['All', 'General', 'ICU', 'Emergency', 'Pediatric'];

  const handleStatusChange = async (bedId: string, newStatus: any) => {
    try {
      const bed = beds.find(b => b.id === bedId);
      await updateBedStatus(bedId, newStatus);
      toast.success(`Bed status updated to ${newStatus}`);

      // Subscription Logic: If bed becomes vacant, notify subscribers
      if (newStatus === 'vacant' && bed) {
        const subs = await findRelevantSubscriptions(bed.ward, bed.type);
        for (const sub of subs as any[]) {
          await createNotification(
            sub.userId,
            'Bed Available!',
            `A ${bed.type} bed (${bed.number}) in ${bed.ward} is now vacant.`,
            'success'
          );
        }
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleUnsubscribe = async (subId: string) => {
    try {
      await deleteBedSubscription(subId);
      toast.success('Subscription removed');
    } catch (err) {
      toast.error('Failed to unsubscribe');
    }
  };

  const handleDeleteBed = async (bedId: string) => {
    if (!window.confirm('Are you sure you want to delete this bed?')) return;
    try {
      await deleteBed(bedId);
      toast.success('Bed removed from inventory');
    } catch (err) {
      toast.error('Failed to delete bed');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Bed Management</h1>
          <p className="text-slate-500">Real-time occupancy and inventory tracking across all wards.</p>
        </div>
        {(profile?.role === 'admin' || profile?.role === 'receptionist') && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
          >
            <Plus size={18} />
            Add New Bed
          </button>
        )}
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard 
          label="Total Beds" 
          value={beds.length} 
          icon={<Hotel size={20} />} 
          color="blue"
        />
        <StatCard 
          label="Total Patients" 
          value={beds.filter(b => b.status === 'occupied').length} 
          icon={<UserPlus size={20} />} 
          color="indigo"
        />
        <StatCard 
          label="Available" 
          value={beds.filter(b => b.status === 'vacant').length} 
          icon={<CheckCircle2 size={20} />} 
          color="green"
        />
        <StatCard 
          label="Maintenance" 
          value={beds.filter(b => ['cleaning', 'maintenance'].includes(b.status)).length} 
          icon={<RefreshCw size={20} />} 
          color="red"
        />
        <StatCard 
          label="Occupancy Rate" 
          value={beds.length > 0 ? Math.round((beds.filter(b => b.status === 'occupied').length / beds.length) * 100) + '%' : '0%'} 
          icon={<TrendingUp size={20} />} 
          color="amber"
        />
      </div>

      {/* Patient Occupancy Banner */}
      {beds.filter(b => b.status === 'occupied').length > 0 && (
        <div className="bg-slate-900 rounded-[2.5rem] p-8 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full -mr-20 -mt-20" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md">
              <h2 className="text-2xl font-black text-white mb-2">Current Occupants</h2>
              <p className="text-slate-400 text-sm italic">Tracking {beds.filter(b => b.status === 'occupied').length} active patient admissions across all departments.</p>
            </div>
            <div className="flex-1 overflow-x-auto no-scrollbar pb-2">
              <div className="flex gap-4 min-w-max">
                {beds.filter(b => b.status === 'occupied').map((bed, idx) => (
                  <motion.div 
                    key={bed.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 p-5 rounded-3xl w-56 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black text-white text-xs">
                        {bed.number}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">{bed.department}</p>
                        <p className="text-[10px] font-bold text-white/40 truncate w-32 uppercase tracking-tighter">{bed.ward}</p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-white truncate">{bed.patientName}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Search by bed number or patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-600/5 transition-all"
            />
          </div>
          
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
            <button 
              onClick={() => setView('grid')}
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                view === 'grid' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Grid
            </button>
            <button 
              onClick={() => setView('history')}
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                view === 'history' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              History
            </button>
            <button 
              onClick={() => setView('requests')}
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all relative",
                view === 'requests' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Requests
              {profile?.role !== 'patient' && bedRequests.filter(r => r.status === 'pending').length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full">
                  {bedRequests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
          </div>

          {profile?.role === 'patient' && (
            <div className="flex gap-2">
              <button 
                onClick={() => setIsRequestModalOpen(true)}
                className="px-4 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                <Plus size={16} />
                Book Bed
              </button>
              <button 
                onClick={() => setIsSubscribeModalOpen(true)}
                className="px-4 py-3 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold border border-blue-100 hover:bg-blue-100 transition-all flex items-center gap-2"
              >
                <BellPlus size={16} />
                Alerts
              </button>
            </div>
          )}
        </div>

        {view === 'grid' && (
          <div className="flex flex-col gap-4 pt-4 border-t border-slate-50">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-3 min-w-[60px]">Ward</span>
              {wards.map(ward => (
                <button
                  key={ward}
                  onClick={() => setWardFilter(ward)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[10px] font-bold transition-all border",
                    wardFilter === ward 
                      ? "bg-slate-900 text-white border-slate-900" 
                      : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                  )}
                >
                  {ward}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-3 min-w-[60px]">Type</span>
              {bedTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[10px] font-bold transition-all border",
                    typeFilter === type 
                      ? "bg-blue-600 text-white border-blue-600" 
                      : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Subscriptions (Patient Only) */}
      {profile?.role === 'patient' && mySubscriptions.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {mySubscriptions.map(sub => (
            <div key={sub.id} className="px-4 py-2 bg-slate-900 text-white rounded-full text-[10px] font-bold flex items-center gap-3">
              <span className="opacity-60">ALERT:</span> {sub.ward} • {sub.bedType}
              <button 
                onClick={() => handleUnsubscribe(sub.id)}
                className="hover:text-red-400 p-1"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}      {/* Main Content Area */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredBeds.map(bed => (
              <BedCard 
                key={bed.id} 
                bed={bed} 
                role={profile?.role}
                onStatusChange={handleStatusChange}
                onDelete={() => handleDeleteBed(bed.id)}
                onAssign={() => {
                  setSelectedBed(bed);
                  setIsAssignModalOpen(true);
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : view === 'history' ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bed #</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Result</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Involved Patient</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Handled By</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {history.map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4">
                    <span className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">{log.bedNumber}</span>
                  </td>
                  <td className="px-8 py-4 text-sm font-medium text-slate-700">{log.action}</td>
                  <td className="px-8 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                      STATUS_COLORS[log.status as keyof typeof STATUS_COLORS]
                    )}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-sm font-bold text-slate-600">
                    {log.patientName || <span className="text-slate-300">N/A</span>}
                  </td>
                  <td className="px-8 py-4 text-sm font-medium text-slate-500">{log.performedBy}</td>
                  <td className="px-8 py-4 text-sm text-slate-400 text-right font-mono">
                    {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : 'Just now'}
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-slate-400 italic">No activity history recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type Requested</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Requested At</th>
                {profile?.role !== 'patient' && <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bedRequests.map((req: any) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-slate-900">{req.patientName}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">{req.preferredWard || 'No ward preference'}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-black">{req.bedType}</span>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-500 max-w-xs truncate">{req.reason}</td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                      req.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      req.status === 'accepted' ? 'bg-green-50 text-green-600 border-green-100' :
                      'bg-red-50 text-red-600 border-red-100'
                    )}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right text-xs font-mono text-slate-400">
                    {req.createdAt?.toDate ? req.createdAt.toDate().toLocaleString() : 'Just now'}
                  </td>
                  {profile?.role !== 'patient' && (
                    <td className="px-8 py-6">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={async () => {
                              await updateBedRequestStatus(req.id, 'accepted');
                              toast.success('Request accepted. You can now assign a bed.');
                              setView('grid');
                              setSearchQuery(req.patientName);
                            }}
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all border border-green-200"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                          <button 
                            onClick={async () => {
                              if (window.confirm('Reject this request?')) {
                                await updateBedRequestStatus(req.id, 'rejected');
                                toast.error('Request rejected');
                              }
                            }}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all border border-red-200"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center italic text-[10px] text-slate-400 uppercase font-black">Processed</div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {bedRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-slate-400 italic">No admission requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddBedModal onClose={() => setIsAddModalOpen(false)} />
        )}
        {isAssignModalOpen && selectedBed && (
          <AssignPatientModal 
            bed={selectedBed} 
            onClose={() => {
              setIsAssignModalOpen(false);
              setSelectedBed(null);
            }} 
          />
        )}
        {isSubscribeModalOpen && (
          <SubscribeModal 
            onClose={() => setIsSubscribeModalOpen(false)} 
            wards={wards.filter(w => w !== 'All')}
            bedTypes={['General', 'ICU', 'Emergency', 'Pediatric']}
            userId={user?.uid}
          />
        )}
        {isRequestModalOpen && (
          <RequestBedModal 
            onClose={() => setIsRequestModalOpen(false)}
            beds={beds}
            user={user}
            profile={profile}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function RequestBedModal({ onClose, beds, user, profile }: any) {
  const [formData, setFormData] = useState({
    bedType: 'General',
    preferredWard: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);

  // Get unique wards that have at least one vacant bed of the SELECTED TYPE
  const vacantWards = useMemo(() => {
    return Array.from(new Set(
      beds
        .filter((b: any) => b.status === 'vacant' && b.type === formData.bedType)
        .map((b: any) => b.ward)
    )) as string[];
  }, [beds, formData.bedType]);

  // Get counts for display for the selected type
  const wardBeds = useMemo(() => {
    return vacantWards.map(ward => ({
      name: ward,
      count: beds.filter((b: any) => b.ward === ward && b.status === 'vacant' && b.type === formData.bedType).length
    }));
  }, [vacantWards, beds, formData.bedType]);

  // Automatically update preferred ward when type changes
  useEffect(() => {
    if (vacantWards.length > 0 && !vacantWards.includes(formData.preferredWard)) {
      setFormData(prev => ({ ...prev, preferredWard: vacantWards[0] }));
    } else if (vacantWards.length === 0) {
      setFormData(prev => ({ ...prev, preferredWard: '' }));
    }
  }, [vacantWards, formData.bedType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.preferredWard) {
      toast.error(`No vacant ${formData.bedType} beds available`);
      return;
    }
    setLoading(true);
    try {
      await createBedRequest({
        ...formData,
        userId: user.uid,
        patientName: profile?.name || user.email || 'Anonymous',
      });
      toast.success('Your admission request has been sent!');
      onClose();
    } catch (err) {
      toast.error('Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-white rounded-[3rem] p-10">
        <h3 className="text-2xl font-black text-slate-900 mb-2">Book a Bed</h3>
        <p className="text-sm text-slate-500 mb-8">Request admission. Showing only wards with <span className="text-green-600 font-bold">vacant beds</span>.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 text-left">Bed Category</label>
            <select 
              value={formData.bedType} 
              onChange={(e) => setFormData({...formData, bedType: e.target.value})} 
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-blue-600/5 outline-none"
            >
              {['General', 'ICU', 'Emergency', 'Pediatric'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Preferred Ward (Available Only)</label>
            <select 
              value={formData.preferredWard} 
              onChange={(e) => setFormData({...formData, preferredWard: e.target.value})} 
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-blue-600/5 outline-none"
              required
            >
              {wardBeds.length > 0 ? (
                wardBeds.map(ward => (
                  <option key={ward.name} value={ward.name}>
                    {ward.name} ({ward.count} vacancy)
                  </option>
                ))
              ) : (
                <option value="">No beds available in any ward</option>
              )}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Reason for Admission</label>
            <textarea 
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              placeholder="e.g. Scheduled surgery, severe flu symptoms..."
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-blue-600/5 outline-none"
              required
            />
          </div>
          <button 
            disabled={loading || wardBeds.length === 0} 
            className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 shadow-xl shadow-slate-100"
          >
            {loading ? 'Sending...' : wardBeds.length === 0 ? 'Fully Booked' : 'Submit Request'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function SubscribeModal({ onClose, wards, bedTypes, userId }: any) {
  const [ward, setWard] = useState(wards[0] || '');
  const [type, setType] = useState(bedTypes[0] || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !ward || !type) return;
    setLoading(true);
    try {
      await createBedSubscription(userId, ward, type);
      toast.success('Subscription active. We will notify you!');
      onClose();
    } catch (err) {
      toast.error('Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-white rounded-[3rem] p-10">
        <h3 className="text-2xl font-black text-slate-900 mb-2">Subscribe to Alerts</h3>
        <p className="text-sm text-slate-500 mb-8">Get notified instantly when a specific bed becomes vacant.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Ward</label>
            <select value={ward} onChange={(e) => setWard(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold">
              {wards.map((w: string) => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Bed Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold">
              {bedTypes.map((t: string) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg active:scale-95 transition-all">
            {loading ? 'Subscribing...' : 'Activate Notifications'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500", colors[color])}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900">{value}</p>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}

function BedCard({ bed, onStatusChange, onAssign, onDelete, role }: any) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-6">
        <div className={cn(
          "w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black",
          bed.status === 'vacant' ? "bg-green-50 text-green-600" : "bg-slate-50 text-slate-600"
        )}>
          <span className="text-[10px] opacity-60 uppercase">Bed</span>
          <span className="text-lg">{bed.number}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
            STATUS_COLORS[bed.status as keyof typeof STATUS_COLORS]
          )}>
            {bed.status}
          </div>
          {role === 'admin' && (
            <button 
              onClick={onDelete}
              className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Ward / Dept</p>
          <p className="text-sm font-bold text-slate-900">{bed.ward} • {bed.department}</p>
        </div>
        
        {bed.status === 'occupied' && (
          <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              <UserPlus size={10} /> Active Patient
            </p>
            <p className="text-sm font-black text-blue-900">{bed.patientName}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {bed.status === 'vacant' ? (
          <button 
            onClick={onAssign}
            className="col-span-2 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-100"
          >
            Assign Patient
          </button>
        ) : (
          <>
            <button 
              onClick={() => onStatusChange(bed.id, 'vacant')}
              className="py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-green-50 hover:text-green-600 transition-all"
            >
              Release
            </button>
            <select 
              value={bed.status}
              onChange={(e) => onStatusChange(bed.id, e.target.value)}
              className="py-3 bg-white border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-50 outline-none px-2"
            >
              <option value="occupied">Occupied</option>
              <option value="cleaning">Cleaning</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </>
        )}
      </div>
    </motion.div>
  );
}

function AddBedModal({ onClose }: any) {
  const [formData, setFormData] = useState({
    number: '',
    ward: '',
    department: '',
    type: 'General',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBed(formData);
      toast.success('Bed created successfully');
      onClose();
    } catch (err) {
      toast.error('Failed to create bed');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
        
        <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Add New Bed</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Bed Number</label>
            <input 
              required
              type="text"
              value={formData.number}
              onChange={(e) => setFormData({...formData, number: e.target.value})}
              placeholder="e.g. 101, ICU-05"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/5 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Ward</label>
              <input 
                required
                type="text"
                value={formData.ward}
                onChange={(e) => setFormData({...formData, ward: e.target.value})}
                placeholder="East Wing"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/5 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none"
              >
                <option value="General">General</option>
                <option value="ICU">ICU</option>
                <option value="Emergency">Emergency</option>
                <option value="Pediatric">Pediatric</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Department</label>
            <input 
              required
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              placeholder="e.g. Cardiology"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-slate-200 mt-4 active:scale-95 transition-all"
          >
            Register Bed
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function AssignPatientModal({ bed, onClose }: any) {
  const [patientName, setPatientName] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = getPatients((data) => setPatients(data));
    return () => unsubscribe();
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId && !patientName) return;
    
    setLoading(true);
    try {
      const finalName = selectedPatientId 
        ? patients.find(p => p.id === selectedPatientId)?.name 
        : patientName;
        
      await updateBedStatus(bed.id, 'occupied', selectedPatientId || 'guest-' + Date.now(), finalName);
      toast.success(`Patient assigned to Bed ${bed.number}`);
      onClose();
    } catch (err) {
      toast.error('Assignment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
        className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-8 md:p-10 text-center"
      >
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <UserPlus size={40} />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Assign Patient</h3>
        <p className="text-slate-500 text-sm mb-8 italic">Assigning to Bed <span className="font-black text-blue-600">{bed.number}</span></p>
        
        <form onSubmit={handleAssign} className="space-y-6 text-left">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Select Registered Patient</label>
            <select 
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none"
            >
              <option value="">-- Choose Patient --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
              ))}
            </select>
          </div>

          <div className="relative py-2 flex items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-[10px] font-black uppercase tracking-widest text-slate-300">OR ENTER MANUALLY</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Temporary / Guest Name</label>
            <input 
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              disabled={!!selectedPatientId}
              placeholder="e.g. John Doe (External)"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/5 transition-all disabled:opacity-30"
            />
          </div>

          <button 
            type="submit"
            disabled={loading || (!selectedPatientId && !patientName)}
            className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-100 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Confirm Assignment'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

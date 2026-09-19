import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Users, UserRound, Calendar, CreditCard, Activity, 
  TrendingUp, ArrowUpRight, ArrowDownRight, Download, Clock, Zap, Shield, Bell, Hotel
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { cn, formatCurrency } from '../../lib/utils';
import { getStats, getStaff, getLogs, exportToCSV, getNotifications, createNotification } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import NotificationCenter from '../../components/common/NotificationCenter';
import toast from 'react-hot-toast';

const chartData = [
  { name: 'Mon', appointments: 45, revenue: 2400 },
  { name: 'Tue', appointments: 52, revenue: 2800 },
  { name: 'Wed', appointments: 38, revenue: 2100 },
  { name: 'Thu', appointments: 65, revenue: 3500 },
  { name: 'Fri', appointments: 48, revenue: 2600 },
  { name: 'Sat', appointments: 24, revenue: 1200 },
  { name: 'Sun', appointments: 18, revenue: 900 },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ patients: 0, doctors: 0, appointments: 0, revenue: 0, totalBeds: 0, occupiedBeds: 0 });
  const [staff, setStaff] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Seed notifications for admin
    const checkAndSeedNotifs = async () => {
      const unsubscribeNotifs = getNotifications(async (notifs) => {
        if (notifs.length === 0) {
          await createNotification(user.uid, 'Welcome to Control Center', 'Complete hospital overview is now available.', 'info');
        }
        unsubscribeNotifs();
      }, user.uid);
    };
    checkAndSeedNotifs();

    const fetchStats = async () => {
      const s = await getStats();
      if (s) setStats(s as any);
    };
    
    fetchStats();
    
    const unsubscribeStaff = getStaff((data) => {
      setStaff(data);
      setLoading(false);
    });

    const unsubscribeLogs = getLogs((data) => {
      setLogs(data);
    });

    return () => {
      unsubscribeStaff();
      unsubscribeLogs();
    };
  }, [user]);

  const handleExport = () => {
    exportToCSV(staff, 'Hospital_Staff_Report');
    toast.success('Report generated successfully');
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <NotificationCenter />
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hospital Command Center</h1>
            <p className="text-slate-500">Real-time overview of your healthcare facility performance.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download size={18} />
            Export Data
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl text-xs font-bold uppercase tracking-widest border border-green-100">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live Systems
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Patients" 
          value={stats.patients.toString()} 
          trend="+12% from last month" 
          icon={<Users size={24} />} 
          trendUp={true}
        />
        <StatsCard 
          title="Active Doctors" 
          value={stats.doctors.toString()} 
          trend="Currently registered" 
          icon={<UserRound size={24} />} 
          trendUp={true}
        />
        <StatsCard 
          title="Bed Occupancy" 
          value={`${stats.totalBeds > 0 ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100) : 0}%`} 
          trend={`${stats.occupiedBeds}/${stats.totalBeds} Beds occupied`} 
          icon={<Hotel size={24} />} 
          trendUp={stats.occupiedBeds / stats.totalBeds > 0.8}
        />
        <StatsCard 
          title="Total Revenue" 
          value={formatCurrency(stats.revenue)} 
          trend="+8% vs last month" 
          icon={<CreditCard size={24} />} 
          trendUp={true}
        />
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900">Health Logistics</h3>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold uppercase transition-colors">Daily</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase shadow-lg shadow-blue-200">Weekly</button>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Mon', beds: 42, reqs: 12 },
                { name: 'Tue', beds: 45, reqs: 18 },
                { name: 'Wed', beds: 38, reqs: 15 },
                { name: 'Thu', beds: 52, reqs: 22 },
                { name: 'Fri', beds: 48, reqs: 25 },
                { name: 'Sat', beds: 24, reqs: 10 },
                { name: 'Sun', beds: 18, reqs: 8 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="beds" fill="#2563eb" radius={[6, 6, 0, 0]} name="Occupied Beds" />
                <Bar dataKey="reqs" fill="#94a3b8" radius={[6, 6, 0, 0]} name="New Requests" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-6">Department Efficiency</h3>
            <div className="space-y-6">
              <DepartmentProgress name="Cardiology" value={85} color="bg-blue-400" />
              <DepartmentProgress name="Neurology" value={72} color="bg-purple-400" />
              <DepartmentProgress name="Pediatrics" value={94} color="bg-emerald-400" />
              <DepartmentProgress name="Orthopedics" value={60} color="bg-orange-400" />
              <DepartmentProgress name="Radiology" value={88} color="bg-pink-400" />
            </div>
            <div className="mt-10 p-6 bg-white/10 rounded-3xl backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-green-400/20 rounded-full flex items-center justify-center text-green-400">
                  <Activity size={20} />
                </div>
                <div className="text-sm font-bold uppercase tracking-widest text-green-400">System Pulse</div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">All hospital systems are operating normally. 98% bed occupancy in emergency ward.</p>
            </div>
          </div>
          {/* Abstract Bg */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px]" />
        </div>
      </div>

      {/* Recent Activity & Logs */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">Hospital Staff</h3>
            <Link to="/staff" className="text-sm font-bold text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading staff data...</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                    <th className="px-8 py-4">Full Name</th>
                    <th className="px-8 py-4">Department</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staff.slice(0, 5).map((member) => (
                    <StaffRow 
                      key={member.id}
                      name={member.name} 
                      dept={member.department || 'General'} 
                      status="Active" 
                      joined={member.createdAt ? new Date(member.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}
                      avatar={member.name.charAt(0)} 
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm flex flex-col">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock size={20} className="text-blue-600" />
              Activity Feed
            </h3>
            <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-md tracking-widest">Live</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[500px]">
             {logs.length > 0 ? (
               logs.map(log => (
                 <div key={log.id} className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                       <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Activity size={14} />
                       </div>
                       <div className="w-0.5 flex-1 bg-slate-100 my-2" />
                    </div>
                    <div className="pb-4">
                       <div className="text-xs font-bold text-slate-900 mb-1">{log.action}</div>
                       <p className="text-xs text-slate-500 mb-2 leading-relaxed">{log.details || log.module}</p>
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{log.userName}</span>
                          <span className="w-1 h-1 bg-slate-200 rounded-full" />
                          <span className="text-[10px] text-slate-400">
                             {log.timestamp ? new Date(log.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </span>
                       </div>
                    </div>
                 </div>
               ))
             ) : (
               <div className="text-center py-12 text-slate-400 text-sm">No recent activity detected.</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, trend, icon, trendUp }: { title: string, value: string, trend: string, icon: React.ReactNode, trendUp: boolean }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center border border-slate-100">
          {icon}
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full",
          trendUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
        )}>
          {trendUp ? <TrendingUp size={14} /> : <ArrowDownRight size={14} />}
          {trendUp ? '+12%' : '-2%'}
        </div>
      </div>
      <h3 className="text-slate-500 text-sm font-semibold mb-1">{title}</h3>
      <div className="text-2xl font-bold text-slate-900 mb-2">{value}</div>
      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{trend}</div>
    </motion.div>
  );
}

function DepartmentProgress({ name, value, color }: { name: string, value: number, color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
        <span>{name}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full", color)}
        />
      </div>
    </div>
  );
}

function StaffRow({ name, dept, status, joined, avatar }: any) {
  const statusColors = {
    'Active': 'bg-green-100 text-green-600',
    'Surgery': 'bg-blue-100 text-blue-600',
    'Off Duty': 'bg-slate-100 text-slate-600',
  };
  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center font-bold text-slate-600 text-xs shadow-sm">
            {avatar}
          </div>
          <span className="text-sm font-bold text-slate-900">{name}</span>
        </div>
      </td>
      <td className="px-8 py-4">
        <span className="text-sm text-slate-500 font-medium">{dept}</span>
      </td>
      <td className="px-8 py-4">
        <span className={cn("text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full", statusColors[status as keyof typeof statusColors])}>
          {status}
        </span>
      </td>
      <td className="px-8 py-4">
        <span className="text-xs font-bold text-slate-900">{joined}</span>
      </td>
      <td className="px-8 py-4 text-right">
        <button className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-blue-600 transition-colors shadow-sm opacity-0 group-hover:opacity-100">
          <ArrowUpRight size={18} />
        </button>
      </td>
    </tr>
  );
}

import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, LayoutDashboard, Users, UserRound, Calendar, 
  FileText, CreditCard, LogOut, Menu, X, Bell, Search, Settings,
  Hotel
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const menuItems = {
    admin: [
      { path: '/dashboard/admin', icon: LayoutDashboard, label: 'Overview' },
      { path: '/dashboard/doctors', icon: UserRound, label: 'Doctors' },
      { path: '/dashboard/patients', icon: Users, label: 'Patients' },
      { path: '/dashboard/appointments', icon: Calendar, label: 'Appointments' },
      { path: '/dashboard/beds', icon: Hotel, label: 'Beds' },
      { path: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
    ],
    doctor: [
      { path: '/dashboard/doctor', icon: LayoutDashboard, label: 'Overview' },
      { path: '/dashboard/appointments', icon: Calendar, label: 'Appointments' },
      { path: '/dashboard/beds', icon: Hotel, label: 'Ward Status' },
      { path: '/dashboard/records', icon: FileText, label: 'Patient Records' },
    ],
    patient: [
      { path: '/dashboard/patient', icon: LayoutDashboard, label: 'Health Hub' },
      { path: '/dashboard/appointments', icon: Calendar, label: 'My Bookings' },
      { path: '/dashboard/beds', icon: Hotel, label: 'Bed Availability' },
      { path: '/dashboard/billing', icon: CreditCard, label: 'Invoices' },
    ],
    receptionist: [
      { path: '/dashboard/receptionist', icon: LayoutDashboard, label: 'Reception' },
      { path: '/dashboard/appointments', icon: Calendar, label: 'Manage Queue' },
      { path: '/dashboard/beds', icon: Hotel, label: 'Bed Management' },
      { path: '/dashboard/patients', icon: Users, label: 'Registration' },
    ]
  };

  const currentMenu = profile ? menuItems[profile.role] : [];
  const sidebarWidth = 288; // 72 * 4

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -sidebarWidth }}
              animate={{ x: 0 }}
              exit={{ x: -sidebarWidth }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed lg:relative w-72 bg-white border-r border-slate-200 h-screen z-50 flex flex-col"
            >
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <Activity size={24} />
                  </div>
                  <span className="text-xl font-bold tracking-tight">MedPulse</span>
                </div>
              </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
              {currentMenu.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-sm font-semibold",
                      isActive 
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-100">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 transition-colors text-sm font-bold"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Navbar */}
        <header className="h-20 bg-white/70 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-xl lg:flex items-center justify-center text-slate-500"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="hidden md:flex items-center bg-slate-100 rounded-2xl px-4 py-2 w-96">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-slate-100 rounded-xl text-slate-500">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-900">{profile?.name}</div>
                <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{profile?.role}</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-100">
                {profile?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

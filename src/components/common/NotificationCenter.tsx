import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Check, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markNotificationAsRead } from '../../services/firestoreService';
import { cn } from '../../lib/utils';

export default function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = getNotifications((data) => {
      setNotifications(data);
    }, user.uid);

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-green-500" size={16} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={16} />;
      case 'error': return <AlertCircle className="text-red-500" size={16} />;
      default: return <Info className="text-blue-500" size={16} />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-3 rounded-2xl transition-all active:scale-95 border",
          isOpen ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-500 hover:border-blue-200 shadow-sm"
        )}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10, x: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute right-0 mt-4 w-[320px] bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-2 z-[100]"
          >
            <div className="p-4 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Live Updates</h3>
              <span className="text-[10px] font-bold text-slate-400">{notifications.length} Total</span>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2 space-y-1">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    onClick={() => !notif.read && markNotificationAsRead(notif.id)}
                    className={cn(
                      "p-4 rounded-2xl transition-all cursor-pointer relative group",
                      notif.read ? "hover:bg-slate-50" : "bg-blue-50/50 hover:bg-blue-50 border border-blue-100"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className="mt-1">{getIcon(notif.type)}</div>
                      <div className="flex-1">
                        <p className={cn("text-xs font-bold leading-tight mb-1", notif.read ? "text-slate-700" : "text-blue-900")}>
                          {notif.title}
                        </p>
                        <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-[9px] text-slate-400 mt-2 font-medium">
                          {notif.createdAt?.toDate ? new Date(notif.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-1 shrink-0 shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Bell size={24} />
                  </div>
                  <p className="text-sm font-bold text-slate-400">All caught up!</p>
                  <p className="text-xs text-slate-300 mt-1">No new updates right now.</p>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-50">
              <button className="w-full py-2.5 text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 tracking-widest transition-colors">
                View All Notification History
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

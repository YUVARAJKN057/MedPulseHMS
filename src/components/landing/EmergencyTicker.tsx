import React from 'react';
import { Phone, Clock, AlertTriangle, ShieldCheck, Activity, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmergencyTicker() {
  const [erWaitMinutes, setErWaitMinutes] = React.useState(7);

  React.useEffect(() => {
    // Subtle real-time fluctuation to simulate live hospital queue telemetry
    const interval = setInterval(() => {
      setErWaitMinutes((prev) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return next >= 5 && next <= 12 ? next : prev;
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 text-xs py-2 px-4 relative z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-2.5 py-0.5 rounded-full font-semibold border border-red-500/30">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 -ml-2.5" />
            <span className="tracking-wide uppercase text-[10px]">Emergency Wing Live</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
            <Clock size={13} className="text-blue-400" />
            <span>Avg. ER Triage Wait:</span>
            <strong className="text-white font-mono bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
              {erWaitMinutes} mins
            </strong>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-slate-300">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>Trauma Center:</span>
            <span className="text-emerald-400 font-medium">Level 1 Active</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-slate-300">
            <Activity size={13} className="text-indigo-400" />
            <span>Blood Bank Reserve:</span>
            <span className="text-slate-200 font-medium">All Types Stable</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => document.getElementById('ai-top-assistant')?.scrollIntoView({ behavior: 'smooth' })}
            className="hidden sm:inline-flex items-center gap-1.5 text-blue-300 hover:text-white font-semibold transition-colors bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-400/30"
          >
            <Activity size={12} className="text-amber-300" />
            <span>AI Triage (Live)</span>
          </button>

          <a
            href="tel:+18886337857"
            className="flex items-center gap-1.5 text-red-300 hover:text-red-200 font-semibold transition-colors group"
          >
            <Phone size={13} className="group-hover:rotate-12 transition-transform" />
            <span>24/7 Hotline:</span>
            <span className="text-white font-mono">+1 (888) MED-PULSE</span>
          </a>

          <Link
            to="/dashboard/patient"
            className="hidden md:inline-flex items-center gap-1 text-slate-300 hover:text-white font-medium transition-colors"
          >
            <span>Express Check-in</span>
            <ChevronRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}

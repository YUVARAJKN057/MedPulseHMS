import React from 'react';
import { Activity, Users, Bed, Heart, AlertTriangle, ShieldCheck, Clock, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface WingTelemetry {
  name: string;
  occupancy: number;
  totalBeds: number;
  activeDoctors: number;
  avgWait: string;
  vitalStatus: string;
  statusColor: string;
}

const WINGS: Record<string, WingTelemetry> = {
  Emergency: {
    name: 'Emergency Trauma Wing',
    occupancy: 28,
    totalBeds: 32,
    activeDoctors: 14,
    avgWait: '6.4 mins',
    vitalStatus: 'Level-1 Trauma Operational',
    statusColor: 'text-emerald-500',
  },
  ICU: {
    name: 'Critical Care / ICU',
    occupancy: 21,
    totalBeds: 24,
    activeDoctors: 8,
    avgWait: '0 min (Direct Admission)',
    vitalStatus: 'All Ventilators Synchronized',
    statusColor: 'text-blue-500',
  },
  Surgical: {
    name: 'Surgical Suites & OR',
    occupancy: 6,
    totalBeds: 8,
    activeDoctors: 12,
    avgWait: 'Scheduled Batches',
    vitalStatus: 'Sterility Rating 100%',
    statusColor: 'text-indigo-500',
  },
};

export default function HospitalTelemetryHud() {
  const [activeWing, setActiveWing] = React.useState<keyof typeof WINGS>('Emergency');
  const [heartRate, setHeartRate] = React.useState(74);
  const current = WINGS[activeWing];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setHeartRate((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = prev + delta;
        return next >= 68 && next <= 82 ? next : 74;
      });
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const occupancyPercent = Math.round((current.occupancy / current.totalBeds) * 100);

  return (
    <div className="relative rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-7 text-white shadow-2xl overflow-hidden">
      {/* Background ambient medical grid */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Header telemetry status */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Activity size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-white">MedPulse Live Hospital HUD</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ONLINE
              </span>
            </div>
            <span className="text-xs text-slate-400">Multi-Ward Core Telemetry & Vitals</span>
          </div>
        </div>

        {/* Wing switchers */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          {(Object.keys(WINGS) as Array<keyof typeof WINGS>).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveWing(key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeWing === key
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Real-time ECG Waveform Display */}
      <div className="mt-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Heart size={14} className="text-red-500 fill-red-500/30 animate-pulse" />
            <strong className="text-white text-sm">{heartRate}</strong> BPM (ECG Lead II)
          </span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Vitals Stable • SpO2: 99%
          </span>
        </div>

        {/* SVG Animated Pulse Line */}
        <div className="w-full h-16 flex items-center relative overflow-hidden">
          <svg
            className="w-full h-full text-emerald-400 stroke-current fill-none stroke-[2]"
            viewBox="0 0 600 60"
            preserveAspectRatio="none"
          >
            <path
              d="M0,30 L60,30 L75,10 L85,50 L95,20 L105,38 L115,30 L200,30 L215,10 L225,50 L235,20 L245,38 L255,30 L340,30 L355,10 L365,50 L375,20 L385,38 L395,30 L480,30 L495,10 L505,50 L515,20 L525,38 L535,30 L600,30"
            />
          </svg>
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {/* Bed occupancy */}
        <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1"><Bed size={13} /> Occupancy</span>
            <span className="font-mono text-white text-xs">{occupancyPercent}%</span>
          </div>
          <div className="text-lg font-bold font-mono text-white">
            {current.occupancy} <span className="text-xs text-slate-400 font-sans font-normal">/ {current.totalBeds} beds</span>
          </div>
          <div className="w-full bg-slate-700/60 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                occupancyPercent > 85 ? 'bg-amber-400' : 'bg-blue-500'
              }`}
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
        </div>

        {/* Rounding Doctors */}
        <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1"><Users size={13} /> Staff Active</span>
          </div>
          <div className="text-lg font-bold font-mono text-white">
            {current.activeDoctors} <span className="text-xs text-slate-400 font-sans font-normal">physicians</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <ShieldCheck size={11} />
            <span>Shift balanced</span>
          </div>
        </div>

        {/* Average wait */}
        <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1"><Clock size={13} /> Avg Intake</span>
          </div>
          <div className="text-lg font-bold font-mono text-white">
            {current.avgWait}
          </div>
          <div className="text-[11px] text-blue-300 mt-1">
            Priority triaged
          </div>
        </div>

        {/* Protocol status */}
        <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1"><Zap size={13} /> Protocol</span>
          </div>
          <div className="text-sm font-bold text-white truncate">
            {current.vitalStatus}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            Zero protocol alerts
          </div>
        </div>
      </div>

      {/* Floating notification simulation */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span>Latest Event: <strong>Stat CBC Lab result</strong> routed to Dr. Chen (Bay 4)</span>
        </div>
        <span className="font-mono text-[11px] text-slate-500">12s ago</span>
      </div>
    </div>
  );
}

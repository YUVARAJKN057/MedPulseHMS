import React from 'react';
import { BrainCircuit, Activity, Sparkles, ShieldCheck, HeartPulse } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import InteractiveAiTriage from './InteractiveAiTriage';
import HospitalTelemetryHud from './HospitalTelemetryHud';

export default function HeroAiAssistantCard() {
  const [activeTab, setActiveTab] = React.useState<'ai' | 'telemetry'>('ai');

  return (
    <div
      id="ai-top-assistant"
      className="relative rounded-3xl bg-white border border-slate-200/90 shadow-2xl shadow-blue-500/10 p-5 md:p-7 overflow-hidden transition-all scroll-mt-28 ring-1 ring-slate-100"
    >
      {/* Subtle top medical ambient glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-blue-100/50 to-indigo-100/30 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Top Header with AI status & Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <BrainCircuit size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                MedPulse AI Clinical Assistant
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Powered by Google Gemini AI • 24/7 Differential Triage
            </p>
          </div>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'ai'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles size={12} className={activeTab === 'ai' ? 'text-amber-300' : ''} />
            <span>AI Assistant</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('telemetry')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'telemetry'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Activity size={12} />
            <span>Hospital Telemetry</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="pt-4 relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'ai' ? (
            <motion.div
              key="ai-triage"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <InteractiveAiTriage />
            </motion.div>
          ) : (
            <motion.div
              key="hospital-telemetry"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <HospitalTelemetryHud />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Card Footer with safety note */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 relative z-10">
        <span className="flex items-center gap-1 text-slate-600">
          <ShieldCheck size={13} className="text-emerald-500" />
          <span>HIPAA-Compliant PHI Encryption</span>
        </span>
        <span className="text-slate-600 font-mono">
          Clinical Decision Support v3.5
        </span>
      </div>
    </div>
  );
}

import React from 'react';
import { motion } from 'motion/react';
import { Activity } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center">
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-200 mb-6"
      >
        <Activity className="text-white" size={40} />
      </motion.div>
      <h2 className="text-xl font-bold text-slate-900 tracking-tight">MedPulse <span className="text-blue-600">Syncing...</span></h2>
      <p className="text-slate-400 text-sm mt-2 font-medium">Preparing your medical workspace</p>
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon: React.ReactNode, title: string, description: string, action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
      <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-[2rem] flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-xs mb-8">{description}</p>
      {action}
    </div>
  );
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  // Simple implementation for now, can be expanded
  return (
    <div className="p-8 border border-red-100 bg-red-50 rounded-3xl text-red-600">
      <h3 className="font-bold mb-2">Something went wrong</h3>
      <p className="text-sm">{String(children)}</p>
    </div>
  );
}

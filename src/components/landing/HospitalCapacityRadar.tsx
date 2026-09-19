import React from 'react';
import { Bed, Activity, ShieldCheck, Heart, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface ResourceItem {
  name: string;
  category: string;
  available: number;
  total: number;
  unit: string;
  status: 'optimal' | 'moderate' | 'critical';
}

const RESOURCES: ResourceItem[] = [
  {
    name: 'General Medical Ward',
    category: 'Inpatient Beds',
    available: 138,
    total: 160,
    unit: 'beds',
    status: 'optimal',
  },
  {
    name: 'Intensive Care Unit (ICU)',
    category: 'Critical Care',
    available: 5,
    total: 24,
    unit: 'beds',
    status: 'moderate',
  },
  {
    name: 'Pediatric Care Unit',
    category: 'Children’s Wing',
    available: 19,
    total: 24,
    unit: 'beds',
    status: 'optimal',
  },
  {
    name: 'Emergency Trauma Bays',
    category: 'Trauma & Resuscitation',
    available: 4,
    total: 12,
    unit: 'bays',
    status: 'moderate',
  },
  {
    name: 'Surgical Operating Suites',
    category: 'Operating Theaters',
    available: 3,
    total: 8,
    unit: 'suites',
    status: 'optimal',
  },
  {
    name: 'Cardiac Cath Labs',
    category: 'Cardiovascular Intervention',
    available: 2,
    total: 4,
    unit: 'labs',
    status: 'optimal',
  },
];

const BLOOD_RESERVES = [
  { type: 'O+', level: '94%', status: 'Normal Reserve' },
  { type: 'O-', level: '78%', status: 'Adequate' },
  { type: 'A+', level: '92%', status: 'Normal Reserve' },
  { type: 'B+', level: '88%', status: 'Normal Reserve' },
  { type: 'AB-', level: '71%', status: 'Slight Deficit' },
];

export default function HospitalCapacityRadar() {
  const [lastRefreshed, setLastRefreshed] = React.useState('Just now');
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshed('Just now');
    }, 600);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
              <Activity size={14} />
              <span>Real-Time Clinical Transparency</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Hospital Capacity & Clinical Resource Radar
            </h2>
            <p className="text-slate-600 text-base mt-1 max-w-2xl">
              Live automated telemetry from hospital admission sensors, ward telemetry systems, and central dispensary inventory.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono">Updated: {lastRefreshed}</span>
            <button
              type="button"
              onClick={handleManualRefresh}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
              title="Refresh telemetry"
            >
              <RefreshCw size={15} className={isRefreshing ? 'animate-spin text-blue-600' : ''} />
            </button>
          </div>
        </div>

        {/* Capacity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {RESOURCES.map((item) => {
            const percentAvailable = Math.round((item.available / item.total) * 100);
            const isLow = percentAvailable < 30;

            return (
              <div
                key={item.name}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      {item.category}
                    </span>
                    <h4 className="text-base font-bold text-slate-900">{item.name}</h4>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isLow
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {isLow ? 'High Demand' : 'Available'}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 my-3">
                  <span className="text-2xl font-bold font-mono text-slate-900">{item.available}</span>
                  <span className="text-xs text-slate-500 font-medium">
                    of {item.total} {item.unit} available ({percentAvailable}%)
                  </span>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isLow ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${percentAvailable}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Blood Bank & Pharmacy Summary Banner */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Heart size={18} className="text-red-400 fill-red-400/20" />
              <h4 className="text-base font-bold tracking-tight">Central Blood Bank & Pharmacy Reserves</h4>
            </div>
            <p className="text-xs text-slate-400">
              Zero stockout policy enforced. Critical blood types and emergency IV solutions continuously monitored.
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {BLOOD_RESERVES.map((b) => (
              <div
                key={b.type}
                className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-center"
              >
                <div className="text-xs font-black text-red-400">{b.type}</div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">{b.level}</div>
                <div className="text-[9px] text-slate-400 mt-0.5">{b.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

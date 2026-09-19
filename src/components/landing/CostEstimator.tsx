import React from 'react';
import { DollarSign, ShieldCheck, CheckCircle2, ArrowRight, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProcedureEstimate {
  id: string;
  name: string;
  category: string;
  duration: string;
  standardCost: number;
  avgInsuranceCovered: number;
  patientCopay: number;
  inclusions: string[];
}

const PROCEDURES: ProcedureEstimate[] = [
  {
    id: 'proc-1',
    name: 'Executive Full-Body Health Check',
    category: 'Preventive Health',
    duration: '2.5 Hours',
    standardCost: 450,
    avgInsuranceCovered: 350,
    patientCopay: 100,
    inclusions: [
      'Comprehensive CBC + Lipid + Liver panel',
      'Resting 12-lead ECG & cardiac risk assessment',
      'Chest X-Ray with radiologist report',
      '30-minute doctor review & personalized longevity roadmap',
    ],
  },
  {
    id: 'proc-2',
    name: 'Brain & Spine High-Resolution MRI',
    category: 'Diagnostic Radiology',
    duration: '45 Minutes',
    standardCost: 1200,
    avgInsuranceCovered: 1050,
    patientCopay: 150,
    inclusions: [
      '3-Tesla high-field silent MRI sequence',
      'Contrast and non-contrast sequences as indicated',
      'Board-certified neuro-radiologist dual-read signoff',
      'Instant digital DICOM access via MedPulse Patient Portal',
    ],
  },
  {
    id: 'proc-3',
    name: 'Cardiology Consultation & Echo Doppler',
    category: 'Cardiovascular Care',
    duration: '60 Minutes',
    standardCost: 380,
    avgInsuranceCovered: 320,
    patientCopay: 60,
    inclusions: [
      'Clinical consultation with Senior Cardiologist',
      'Full echocardiography with color Doppler flow mapping',
      'Ejection fraction & valvular dynamics report',
      'Automated prescription routing to in-house pharmacy',
    ],
  },
  {
    id: 'proc-4',
    name: 'Orthopedic Joint & Sports Injury Exam',
    category: 'Orthopedics',
    duration: '45 Minutes',
    standardCost: 290,
    avgInsuranceCovered: 240,
    patientCopay: 50,
    inclusions: [
      'Biomechanics gait and range-of-motion exam',
      'Digital dynamic weight-bearing X-Ray series',
      'Targeted physiotherapy regimen formulation',
      'Fast-track MRI booking if ligament tear suspected',
    ],
  },
];

export default function CostEstimator() {
  const [selectedId, setSelectedId] = React.useState('proc-1');
  const selected = PROCEDURES.find((p) => p.id === selectedId) || PROCEDURES[0];

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck size={14} />
            <span>Price Transparency & No Hidden Fees</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Transparent Clinical Cost Estimator
          </h2>
          <p className="text-slate-600 text-base mt-2">
            MedPulse eliminates surprise medical bills. Calculate standard procedural fees, typical insurance contributions, and estimated out-of-pocket co-pays before your appointment.
          </p>
        </div>

        {/* Estimator Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-10 max-w-4xl mx-auto">
          {/* Procedure Selection Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
            {PROCEDURES.map((p) => {
              const isCurrent = p.id === selectedId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase block tracking-wider ${isCurrent ? 'text-blue-200' : 'text-slate-400'}`}>
                    {p.category}
                  </span>
                  <span className="text-xs md:text-sm font-bold block truncate mt-0.5">
                    {p.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Details breakdown */}
          <div className="grid md:grid-cols-12 gap-8 items-center pt-2">
            {/* Left inclusions */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">
                  {selected.category} • Avg Duration: {selected.duration}
                </span>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900">
                  {selected.name}
                </h3>
              </div>

              <div className="space-y-2.5 pt-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Included in this standard clinical episode:
                </span>
                {selected.inclusions.map((inc, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-700">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{inc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right price breakdown */}
            <div className="md:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-500 pb-2 border-b border-slate-200">
                <span>Standard Hospital Fee</span>
                <span className="font-mono text-slate-700 font-bold">${selected.standardCost}</span>
              </div>

              <div className="flex justify-between items-center text-xs text-emerald-700 pb-2 border-b border-slate-200">
                <span>Avg. Commercial Insurance Coverage (80%+)</span>
                <span className="font-mono font-bold">-${selected.avgInsuranceCovered}</span>
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Estimated Patient Co-Pay:
                  </span>
                  <span className="text-3xl font-black font-mono text-slate-900">
                    ${selected.patientCopay}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 block">
                  *Final co-pay determined by your specific health plan deductible.
                </span>
              </div>

              <Link
                to="/dashboard/patient"
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <span>Schedule & Verify Insurance</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

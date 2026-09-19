import React from 'react';
import { Search, Calendar, Stethoscope, MapPin, ArrowRight, CheckCircle2, Star, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface DoctorQuickItem {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  availableSlot: string;
  mode: 'In-Clinic' | 'Telehealth' | 'Both';
  hospital: string;
}

const SAMPLE_DOCTORS: DoctorQuickItem[] = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Jenkins',
    specialty: 'Neurology',
    rating: 4.9,
    availableSlot: 'Today, 2:30 PM',
    mode: 'Both',
    hospital: 'Main Medical Tower, Suite 402',
  },
  {
    id: 'doc-2',
    name: 'Dr. Michael Chen',
    specialty: 'Cardiology',
    rating: 4.95,
    availableSlot: 'Today, 4:15 PM',
    mode: 'In-Clinic',
    hospital: 'Heart & Vascular Pavilion',
  },
  {
    id: 'doc-3',
    name: 'Dr. Elena Rodriguez',
    specialty: 'Pediatrics',
    rating: 4.88,
    availableSlot: 'Tomorrow, 9:00 AM',
    mode: 'Both',
    hospital: 'Childrens Health Wing',
  },
  {
    id: 'doc-4',
    name: 'Dr. James Wilson',
    specialty: 'Orthopedics',
    rating: 4.92,
    availableSlot: 'Today, 5:00 PM',
    mode: 'In-Clinic',
    hospital: 'Sports Medicine & Joint Care',
  },
  {
    id: 'doc-5',
    name: 'Dr. Amara Patel',
    specialty: 'General Medicine',
    rating: 4.85,
    availableSlot: 'Today, 1:45 PM',
    mode: 'Telehealth',
    hospital: 'Primary Care Center',
  },
];

export default function QuickDoctorFinder() {
  const navigate = useNavigate();
  const [selectedSpecialty, setSelectedSpecialty] = React.useState('All');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [consultationMode, setConsultationMode] = React.useState<'All' | 'In-Clinic' | 'Telehealth'>('All');
  const [hasInteracted, setHasInteracted] = React.useState(false);

  const specialties = ['All', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'General Medicine'];

  const filteredDoctors = SAMPLE_DOCTORS.filter((doc) => {
    const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty.toLowerCase() === selectedSpecialty.toLowerCase();
    const matchesSearch =
      searchTerm === '' ||
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.hospital.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMode =
      consultationMode === 'All' ||
      doc.mode === 'Both' ||
      doc.mode === consultationMode;

    return matchesSpecialty && matchesSearch && matchesMode;
  });

  const handleQuickBook = (doctor: DoctorQuickItem) => {
    navigate(`/dashboard/patient?doctor=${encodeURIComponent(doctor.name)}&specialty=${encodeURIComponent(doctor.specialty)}`);
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <Stethoscope size={14} />
            <span>Direct Clinical Scheduling</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Find Available Specialists & Book Today
          </h3>
          <p className="text-sm text-slate-500">
            Real-time verified calendar slots across 14 clinical departments.
          </p>
        </div>

        {/* Consultation Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start md:self-center">
          {(['All', 'In-Clinic', 'Telehealth'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setConsultationMode(mode);
                setHasInteracted(true);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                consultationMode === mode
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {mode === 'All' ? 'All Modes' : mode}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-6">
        {/* Search input */}
        <div className="md:col-span-5 relative">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
            Doctor, Condition or Hospital Wing
          </label>
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setHasInteracted(true);
              }}
              placeholder="e.g. Dr. Jenkins, chest pain, cardiology..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Specialty Selector */}
        <div className="md:col-span-4">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
            Medical Department
          </label>
          <select
            value={selectedSpecialty}
            onChange={(e) => {
              setSelectedSpecialty(e.target.value);
              setHasInteracted(true);
            }}
            className="w-full px-3.5 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
          >
            {specialties.map((spec) => (
              <option key={spec} value={spec}>
                {spec === 'All' ? 'All Specialties (14 Departments)' : spec}
              </option>
            ))}
          </select>
        </div>

        {/* Action Button */}
        <div className="md:col-span-3 flex items-end">
          <Link
            to="/dashboard/patient"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
          >
            <span>Open Booking Desk</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Quick Specialty Pill tags */}
      <div className="flex items-center gap-2 flex-wrap pt-4">
        <span className="text-xs font-semibold text-slate-400">Quick Filters:</span>
        {['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics'].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              setSelectedSpecialty(tag);
              setHasInteracted(true);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedSpecialty === tag
                ? 'bg-blue-100 text-blue-700 font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tag}
          </button>
        ))}
        {selectedSpecialty !== 'All' && (
          <button
            type="button"
            onClick={() => setSelectedSpecialty('All')}
            className="text-xs text-blue-600 hover:underline font-semibold ml-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* Live Available Results preview */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Available Slots ({filteredDoctors.length} Specialists Found)
          </span>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Calendar Sync Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredDoctors.slice(0, 3).map((doctor) => (
            <div
              key={doctor.id}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-sm">
                      {doctor.name}
                    </h4>
                    <span className="text-xs font-semibold text-blue-600">{doctor.specialty}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-[11px] font-bold">
                    <Star size={11} className="fill-amber-400 text-amber-400" />
                    <span>{doctor.rating}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                  <MapPin size={12} className="text-slate-400 shrink-0" />
                  <span className="truncate">{doctor.hospital}</span>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-100/60 mb-3">
                  <Clock size={12} className="text-emerald-600" />
                  <span>Next: <strong>{doctor.availableSlot}</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] font-medium text-slate-400">
                  {doctor.mode} Consult
                </span>
                <button
                  type="button"
                  onClick={() => handleQuickBook(doctor)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Select Slot</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

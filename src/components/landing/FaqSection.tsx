import React from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FaqItem[] = [
  {
    category: 'Patient Care & Booking',
    question: 'How quickly can I schedule an appointment with a specialist?',
    answer:
      'Appointments can be booked in under 45 seconds directly through the MedPulse Patient Portal. Once submitted, your consultation slot is instantly synchronized with the physician’s calendar and an SMS/email confirmation is dispatched with clinic location directions.',
  },
  {
    category: 'AI Diagnostics',
    question: 'How does the Gemini Clinical Diagnostic Assistant assist doctors?',
    answer:
      'The MedPulse AI diagnostic co-pilot acts as decision support for physicians. It synthesizes reported patient symptoms, cross-checks clinical literature for differential diagnoses, flags potential drug-drug interaction contraindications, and highlights urgency levels (1-10) to optimize clinical triage.',
  },
  {
    category: 'Security & Compliance',
    question: 'Is MedPulse compliant with HIPAA, GDPR, and ISO 27001 standards?',
    answer:
      'Yes, MedPulse exceeds global healthcare data security mandates. All Protected Health Information (PHI) is encrypted with AES-256 GCM at rest and TLS 1.3 in transit. Every data access or chart modification event generates a cryptographically signed immutable audit trail.',
  },
  {
    category: 'Hospital Operations',
    question: 'Can MedPulse integrate with existing laboratory and pharmacy hardware?',
    answer:
      'MedPulse supports open HL7, FHIR, and RESTful telemetry hooks. It automatically receives digital analyzer results from central pathology labs, updates bed availability sensors across wards in real-time, and routes e-prescriptions directly to pharmacy dispensing robots.',
  },
  {
    category: 'Billing & Insurance',
    question: 'How does MedPulse handle insurance verification and billing?',
    answer:
      'Our integrated revenue engine connects to clearinghouses for real-time policy eligibility verification upon patient check-in. It estimates patient co-pays, generates itemized invoices, and reduces insurance claim rejections by up to 92%.',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-20 bg-white border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
            <HelpCircle size={14} />
            <span>Answers & Guidance</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-base mt-2">
            Everything you need to know about navigating the MedPulse hospital platform, data privacy, and clinical features.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50 transition-all hover:border-slate-300"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-blue-600 transition-colors"
                >
                  <span className="text-sm md:text-base">{faq.question}</span>
                  <div
                    className={`w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-500 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-blue-600 border-blue-200' : ''
                    }`}
                  >
                    <ChevronDown size={16} />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-slate-600 leading-relaxed border-t border-slate-100/80">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

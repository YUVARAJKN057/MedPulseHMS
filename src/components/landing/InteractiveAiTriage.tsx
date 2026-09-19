import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import {
  BrainCircuit,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  HeartPulse,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DiagnosisResponse {
  diagnosis: string;
  prescription: string;
  urgency: number;
  advice: string;
  warning: string;
  voiceAdvice: string;
}

const CLINICAL_PRESETS = [
  {
    label: 'Chest Pressure',
    prompt: 'Sudden retrosternal chest pressure and mild shortness of breath for 30 minutes.',
  },
  {
    label: 'High Fever & Cough',
    prompt: 'Persistent dry cough, temperature 102.4°F, chills and muscle aches for 3 days.',
  },
  {
    label: 'Severe Migraine',
    prompt: 'Unilateral throbbing headache with light sensitivity, nausea and visual aura.',
  },
  {
    label: 'Knee Swelling',
    prompt: 'Acute knee swelling, localized heat and severe pain after twisting knee during sports.',
  },
];

function HighlightedDiagnosisText({ text, className = '' }: { text: string; className?: string }) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <span
              key={i}
              className="text-slate-900 font-bold bg-amber-100/80 px-1 py-0.5 rounded mx-0.5"
            >
              {part.slice(2, -2)}
            </span>
          );
        }
        return part;
      })}
    </span>
  );
}

export default function InteractiveAiTriage() {
  const [symptoms, setSymptoms] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<DiagnosisResponse | null>(null);
  const [isRecording, setIsRecording] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const recognitionRef = React.useRef<any>(null);

  React.useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0])
          .map((res: any) => res.transcript)
          .join('');
        setSymptoms(transcript);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Voice transcription not supported by your browser.');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSpeak = (text: string) => {
    if (!window.speechSynthesis) {
      toast.error('Voice synthesis not available in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\*\*/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleDiagnose = async (customPrompt?: string) => {
    const promptToSubmit = customPrompt !== undefined ? customPrompt : symptoms;
    if (!promptToSubmit.trim()) return;

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    setLoading(true);
    setResult(null);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);

    try {
      const response = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: promptToSubmit }),
      });

      if (!response.ok) {
        throw new Error('Clinical diagnostic server returned an error.');
      }
      const data = await response.json();
      if (!data || data.error) {
        throw new Error(data?.error || 'Failed to analyze symptoms.');
      }
      setResult(data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Diagnostic co-pilot encountered an error.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (prompt: string) => {
    setSymptoms(prompt);
    handleDiagnose(prompt);
  };

  const resetAll = () => {
    setResult(null);
    setSymptoms('');
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="space-y-4">
      {/* Preset pills for quick testing */}
      {!result && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Sample Clinical Test Cases:
            </span>
            <span className="text-[11px] text-blue-600 font-semibold">1-Click Test</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {CLINICAL_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleSelectPreset(preset.prompt)}
                disabled={loading}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60 transition-all disabled:opacity-50"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {!result ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleDiagnose();
          }}
          className="space-y-4"
        >
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 relative group focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                Describe Patient Symptoms
              </label>
              {isRecording && (
                <span className="flex items-center gap-1 text-[11px] text-red-600 font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  Recording Audio...
                </span>
              )}
            </div>

            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. Sharp pain in lower right quadrant, accompanied by low-grade fever and loss of appetite..."
              rows={3}
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-slate-800 placeholder:text-slate-400 resize-none pr-12"
            />

            <button
              type="button"
              onClick={toggleRecording}
              className={`absolute right-3.5 bottom-3.5 p-2.5 rounded-xl transition-all shadow-sm ${
                isRecording
                  ? 'bg-red-500 text-white animate-bounce'
                  : 'bg-white text-slate-500 border border-slate-200 hover:text-blue-600 hover:border-blue-300'
              }`}
              title={isRecording ? 'Stop voice input' : 'Dictate symptoms'}
            >
              {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !symptoms.trim()}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-slate-200 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Consulting Gemini Clinical Co-Pilot...</span>
              </div>
            ) : (
              <>
                <Sparkles size={16} className="text-blue-400" />
                <span>Run Differential Assessment</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Primary diagnosis card */}
            <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                    <BrainCircuit size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-blue-400 font-bold block">
                      AI Differential Assessment
                    </span>
                    <h4 className="text-base font-bold text-white">
                      <HighlightedDiagnosisText text={result.diagnosis} />
                    </h4>
                  </div>
                </div>

                {/* Urgency Badge */}
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-mono">Urgency Index</span>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-mono font-bold mt-0.5 ${
                      result.urgency >= 7
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : result.urgency >= 4
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {result.urgency}/10 {result.urgency >= 7 ? '• Urgent' : '• Routine'}
                  </span>
                </div>
              </div>

              {/* Advice */}
              <div className="text-xs text-slate-300 leading-relaxed bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
                <strong className="text-white block mb-1">Clinical Recommendations:</strong>
                <HighlightedDiagnosisText text={result.advice} />
              </div>

              {/* Prescription Guidance */}
              <div className="text-xs bg-blue-950/40 p-3 rounded-xl border border-blue-900/60 text-blue-200">
                <strong className="text-blue-100 block mb-1">Prescription & OTC Guidance:</strong>
                <HighlightedDiagnosisText text={result.prescription} />
              </div>

              {/* Voice agent player */}
              {result.voiceAdvice && (
                <div className="flex items-center justify-between p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSpeak(result.voiceAdvice)}
                      className={`p-2 rounded-lg transition-colors ${
                        isSpeaking
                          ? 'bg-blue-600 text-white animate-pulse'
                          : 'bg-slate-700 text-slate-200 hover:text-white hover:bg-slate-600'
                      }`}
                      title="Listen to audio readout"
                    >
                      {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
                    </button>
                    <span className="text-slate-300 font-medium">
                      {isSpeaking ? 'Reading clinical voice advisory...' : 'Audio Voice Readout'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">Speech synthesis</span>
                </div>
              )}

              {/* Disclaimer */}
              <div className="flex items-start gap-2 text-[11px] text-amber-400/90 bg-amber-950/30 p-2.5 rounded-xl border border-amber-900/40">
                <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                <span>{result.warning}</span>
              </div>
            </div>

            {/* Direct Booking Link & Reset actions */}
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard/patient"
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <span>Book Follow-up Consultation</span>
                <ArrowRight size={13} />
              </Link>
              <button
                type="button"
                onClick={resetAll}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw size={13} />
                <span>New Case</span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}


import React, { useState, useEffect } from 'react';
// Added missing icon imports: Zap, Info, Activity. Removed unused Star and Clock.
import { ChevronRight, Pause, Play, CheckCircle, Zap, Info, Activity } from 'lucide-react';
import { CircuitItem } from '../types';

interface StudySessionViewProps {
  mode: 'timer' | 'summary';
  activeSubject: CircuitItem;
  nextSubject?: CircuitItem;
  profileName: string;
  initialSeconds?: number;
  previousNotes?: string;
  onFinish: (data: { questions: number; correct: number; notes: string; duration: number }) => void;
  onFinishAndNext: (data: { questions: number; correct: number; notes: string; duration: number }) => void;
  onCancel: (currentSeconds: number) => void;
}

const StudySessionView: React.FC<StudySessionViewProps> = ({ 
  mode, 
  activeSubject, 
  nextSubject, 
  profileName,
  initialSeconds = 0,
  previousNotes = "Nenhuma observação anterior",
  onFinish, 
  onFinishAndNext,
  onCancel 
}) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);
  const [questions, setQuestions] = useState('');
  const [correct, setCorrect] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    let interval: number | null = null;
    if (isActive && mode === 'timer') {
      interval = window.setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      if (interval) clearInterval(interval);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, seconds, mode]);

  const renderDigitalTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    return (
      <div className="flex items-center gap-12 text-white font-black tabular-nums">
        <div className="flex flex-col items-center">
          <span className="text-[12rem] leading-none tracking-tighter text-glow">{hrs.toString().padStart(2, '0')}</span>
          <span className="text-[12px] font-black text-zinc-600 uppercase tracking-[0.4em] mt-4">Horas</span>
        </div>
        <div className="text-[8rem] leading-none text-zinc-800 opacity-20 -mt-20">:</div>
        <div className="flex flex-col items-center">
          <span className="text-[12rem] leading-none tracking-tighter text-glow">{mins.toString().padStart(2, '0')}</span>
          <span className="text-[12px] font-black text-zinc-600 uppercase tracking-[0.4em] mt-4">Minutos</span>
        </div>
        <div className="text-[8rem] leading-none text-zinc-800 opacity-20 -mt-20">:</div>
        <div className="flex flex-col items-center">
          <span className="text-[12rem] leading-none tracking-tighter text-glow text-blue-500">{secs.toString().padStart(2, '0')}</span>
          <span className="text-[12px] font-black text-zinc-600 uppercase tracking-[0.4em] mt-4">Segundos</span>
        </div>
      </div>
    );
  };

  const formatSimpleTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (mode === 'timer') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[90vh] space-y-16 animate-in fade-in zoom-in duration-700">
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-4">
            <span className="bg-zinc-900/80 backdrop-blur-md px-6 py-2 rounded-full text-[10px] font-black text-zinc-600 border border-white/5 uppercase tracking-[0.2em]">
                {profileName}
            </span>
            <span className="bg-blue-600/10 backdrop-blur-md px-6 py-2 rounded-full text-[10px] font-black text-blue-500 border border-blue-500/20 uppercase tracking-[0.2em]">
                A Seguir: {nextSubject?.subjectName || 'Ciclo Final'}
            </span>
          </div>
          
          <div className="flex items-center gap-6 group">
            <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-blue-600/30 group-hover:scale-110 transition-transform duration-500">
                <Zap size={32} className="fill-white" />
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter">{activeSubject.subjectName}</h2>
          </div>
        </div>

        <div className="relative py-12 px-24">
            {renderDigitalTime(seconds)}
            <div className="absolute inset-0 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        </div>

        <div className="flex items-center gap-8">
            <button 
                onClick={() => setIsActive(!isActive)}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all border shadow-2xl active:scale-90 ${isActive ? 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white' : 'bg-blue-600 border-transparent text-white shadow-blue-600/20 animate-pulse'}`}
            >
                {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
            </button>
            <button 
                onClick={() => onCancel(seconds)} 
                className="px-16 py-8 bg-white text-black font-black rounded-[2.5rem] text-[12px] hover:bg-zinc-200 transition-all shadow-2xl shadow-white/10 active:scale-95 uppercase tracking-[0.3em] flex items-center gap-4"
            >
                <CheckCircle size={20} /> Concluir Sessão
            </button>
        </div>

        <div className="flex items-center gap-5 bg-zinc-900/50 backdrop-blur-xl px-12 py-6 rounded-[2.5rem] border border-white/5 max-w-2xl text-center group cursor-help">
           <Info size={18} className="text-blue-500 group-hover:rotate-12 transition-transform" />
           <p className="text-[11px] font-bold text-zinc-500 italic leading-relaxed">
              <span className="text-zinc-600 font-black uppercase not-italic tracking-widest mr-2 text-[9px]">Anotação Anterior:</span>
              "{previousNotes}"
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-16 px-8 animate-in slide-in-from-bottom duration-700">
      <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-white tracking-tighter mb-4">Métricas do Ciclo</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em]">Consolidando conhecimento: {activeSubject.subjectName}</p>
      </div>

      <div className="bg-[#0c0c0e] rounded-[4rem] shadow-2xl border border-white/5 p-20 max-w-3xl mx-auto relative overflow-hidden">
        <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none">
            <Activity size={120} />
        </div>

        <div className="flex justify-between items-center mb-16">
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-1">Tempo Investido</span>
                <h2 className="text-4xl font-black text-white tabular-nums tracking-tighter">{formatSimpleTime(seconds)}</h2>
            </div>
            <div className="w-16 h-1 bg-zinc-800 rounded-full"></div>
            <div className="text-right">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-1">Status</span>
                <span className="text-emerald-500 font-black text-sm uppercase tracking-widest">Sessão Finalizada</span>
            </div>
        </div>

        <div className="space-y-10">
          <div className="grid grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-2">Questões Totais</label>
                <input 
                  type="number"
                  placeholder="00"
                  value={questions}
                  onChange={(e) => setQuestions(e.target.value)}
                  className="w-full p-6 bg-black/40 border border-white/5 focus:border-blue-500 rounded-[2rem] text-3xl text-white font-black outline-none transition-all placeholder-zinc-800 tabular-nums"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-2">Acertos Reais</label>
                <input 
                  type="number"
                  placeholder="00"
                  value={correct}
                  onChange={(e) => setCorrect(e.target.value)}
                  className="w-full p-6 bg-black/40 border border-white/5 focus:border-emerald-500 rounded-[2rem] text-3xl text-emerald-500 font-black outline-none transition-all placeholder-zinc-800 tabular-nums"
                />
              </div>
          </div>
          
          <div className="space-y-4">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-2">Diário de Bordo / Observações</label>
            <textarea 
              placeholder="O que você aprendeu hoje? Onde teve dificuldade? (Ex: Errei prazos de recurso...)"
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-8 bg-black/40 border border-white/5 focus:border-blue-500 rounded-[2.5rem] text-sm text-zinc-300 font-bold outline-none transition-all resize-none placeholder-zinc-800 leading-relaxed italic"
            />
          </div>
        </div>

        <div className="flex gap-6 mt-20">
          <button 
            onClick={() => onFinish({ questions: Number(questions), correct: Number(correct), notes, duration: seconds })}
            className="flex-1 py-6 bg-zinc-900 text-zinc-600 font-black rounded-3xl hover:bg-zinc-800 hover:text-white transition-all text-[11px] uppercase tracking-widest active:scale-95"
          >
            Encerrar
          </button>
          <button 
            onClick={() => onFinishAndNext({ questions: Number(questions), correct: Number(correct), notes, duration: seconds })}
            className="flex-[2] py-6 bg-blue-600 text-white font-black rounded-3xl hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.2em] active:scale-95"
          >
            Avançar Ciclo <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudySessionView;

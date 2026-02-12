
import React, { useState, useMemo } from 'react';
import { 
  Plus, ChevronLeft, ChevronRight, 
  MousePointer2, RotateCcw, Trash2, LayoutGrid, 
  Layers, CheckCircle2, Clock, Filter, BookOpen, AlertCircle
} from 'lucide-react';
import { ReviewContent } from '../types';

interface ReviewViewProps {
  reviewContents: ReviewContent[];
  onAddContent: (content: Omit<ReviewContent, 'id' | 'createdAt' | 'lastReviewDate' | 'stage'>) => void;
  onUpdateStage: (id: string, customStage?: number) => void;
  onDeleteContent: (id: string) => void;
}

type ReviewSubMode = 'anki' | 'list';

const ReviewView: React.FC<ReviewViewProps> = ({ 
    reviewContents, 
    onAddContent, 
    onUpdateStage, 
    onDeleteContent,
}) => {
  const [subMode, setSubMode] = useState<ReviewSubMode>('anki');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('Todas');
  const [newTopic, setNewTopic] = useState({ subject: '', topic: '', notes: '' });

  // Configuração de Intervalos (em horas)
  // Estágio 1 = 1 dia (24h)
  // Estágio 2 = 3 dias (72h)
  // Estágio 3 = 7 dias (168h)
  const INTERVALS_HOURS = [0, 24, 72, 168];

  const subjects = useMemo(() => {
    const subs = Array.from(new Set(reviewContents.map(item => item.subject)));
    return ['Todas', ...subs];
  }, [reviewContents]);

  const pendingReviews = useMemo(() => {
    return reviewContents.filter(item => {
        const last = new Date(item.lastReviewDate).getTime();
        const now = new Date().getTime();
        const diffHours = (now - last) / (1000 * 60 * 60);
        
        // Pega o intervalo baseado no estágio atual do card
        const targetHours = INTERVALS_HOURS[item.stage] || 24;
        const matchesSubject = selectedSubject === 'Todas' || item.subject === selectedSubject;
        
        return diffHours >= targetHours && matchesSubject;
    });
  }, [reviewContents, selectedSubject]);

  const groupedContents = useMemo(() => {
    const filtered = reviewContents.filter(item => {
      return selectedStage ? item.stage === selectedStage : true;
    });

    const groups: Record<string, ReviewContent[]> = {};
    filtered.forEach(item => {
      if (!groups[item.subject]) groups[item.subject] = [];
      groups[item.subject].push(item);
    });
    return groups;
  }, [reviewContents, selectedStage]);

  const currentAnkiItem = pendingReviews[currentIndex];

  const handleDifficulty = (type: 'facil' | 'medio' | 'dificil') => {
    if (!currentAnkiItem) return;
    
    let nextStage = 1;
    if (type === 'facil') nextStage = 3; // 7 dias
    else if (type === 'medio') nextStage = 2; // 3 dias
    else if (type === 'dificil') nextStage = 1; // 1 dia

    onUpdateStage(currentAnkiItem.id, nextStage);
    setIsFlipped(false);
    
    // Se era o último item da lista filtrada, volta pro início
    if (currentIndex >= pendingReviews.length - 1) {
        setCurrentIndex(0);
    }
  };

  const handleAdd = () => {
    if (newTopic.subject && newTopic.topic) {
        onAddContent(newTopic);
        setNewTopic({ subject: '', topic: '', notes: '' });
        setShowAddModal(false);
    }
  };

  const getProgressInfo = (item: ReviewContent) => {
    const last = new Date(item.lastReviewDate).getTime();
    const now = new Date().getTime();
    const diffHours = (now - last) / (1000 * 60 * 60);
    const targetHours = INTERVALS_HOURS[item.stage] || 24;
    const progress = Math.min(100, Math.round((diffHours / targetHours) * 100));
    return { 
        isReady: diffHours >= targetHours, 
        progress, 
        hoursLeft: Math.max(0, targetHours - diffHours) 
    };
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Revisão em Loop</h1>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Fácil (7d) • Médio (3d) • Difícil (1d)</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-[#141416] p-1.5 rounded-2xl border border-[#202023]">
            <button 
              onClick={() => { setSubMode('anki'); setCurrentIndex(0); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${subMode === 'anki' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Layers size={14} /> Modo Anki
            </button>
            <button 
              onClick={() => setSubMode('list')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${subMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <LayoutGrid size={14} /> Gestão
            </button>
          </div>

          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-900/20 active:scale-95"
          >
            <Plus size={16} /> Novo Card
          </button>
        </div>
      </div>

      {subMode === 'anki' ? (
        /* MODO ANKI */
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-10 overflow-x-auto pb-4 scrollbar-hide gap-2">
            {subjects.map(sub => (
              <button
                key={sub}
                onClick={() => { setSelectedSubject(sub); setCurrentIndex(0); setIsFlipped(false); }}
                className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${selectedSubject === sub ? 'bg-zinc-100 text-black border-white shadow-lg' : 'bg-[#141416] text-zinc-500 border-[#202023] hover:text-zinc-300'}`}
              >
                {sub}
              </button>
            ))}
          </div>

          {pendingReviews.length === 0 ? (
            <div className="text-center py-24 bg-[#141416] rounded-[3rem] border border-[#202023]">
               <div className="inline-flex p-6 bg-zinc-900 rounded-full mb-6 text-zinc-700">
                  <RotateCcw size={48} />
               </div>
               <h3 className="text-xl font-black text-white uppercase tracking-widest">Tudo em dia!</h3>
               <p className="text-zinc-500 text-xs mt-3 max-w-xs mx-auto font-medium">Você revisou todos os cards disponíveis para "{selectedSubject}".</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="text-center mb-8">
                <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-4 py-1.5 rounded-full uppercase tracking-widest mb-3 inline-block">{currentAnkiItem.subject}</span>
                <h2 className="text-2xl font-black text-white tracking-tight leading-tight">{currentAnkiItem.topic}</h2>
              </div>

              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className={`relative w-full min-h-[420px] cursor-pointer transition-all duration-300 transform-style-3d bg-white rounded-3xl shadow-2xl flex items-center justify-center p-14 text-center group ${isFlipped ? 'ring-4 ring-blue-500/20' : 'border border-zinc-100'}`}
              >
                {!isFlipped ? (
                  <div className="animate-in fade-in duration-300">
                    <h3 className="text-2xl md:text-3xl font-black text-zinc-900 leading-tight">
                      {currentIndex + 1}. {currentAnkiItem.topic}
                    </h3>
                  </div>
                ) : (
                  <div className="animate-in zoom-in duration-300">
                    <p className="text-xl font-bold text-zinc-800 leading-relaxed max-w-2xl italic">
                      "{currentAnkiItem.notes || "Sem explicação cadastrada."}"
                    </p>
                  </div>
                )}
                <div className="absolute bottom-8 right-10 flex items-center gap-2 text-zinc-300 font-bold text-[10px] uppercase tracking-widest group-hover:text-zinc-500 transition-colors">
                  <MousePointer2 size={12} /> Clique para ver resposta
                </div>
              </div>

              <div className="w-full mt-12 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex gap-4">
                  <button onClick={() => handleDifficulty('facil')} className="bg-[#10b981] text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 shadow-lg shadow-emerald-900/20 transition-all flex flex-col items-center">
                    <span>Fácil</span>
                    <span className="text-[8px] opacity-70 mt-1">7 DIAS</span>
                  </button>
                  <button onClick={() => handleDifficulty('medio')} className="bg-[#fbbf24] text-[#78350f] px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 shadow-lg shadow-amber-900/20 transition-all flex flex-col items-center">
                    <span>Médio</span>
                    <span className="text-[8px] opacity-70 mt-1">3 DIAS</span>
                  </button>
                  <button onClick={() => handleDifficulty('dificil')} className="bg-[#ef4444] text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 shadow-lg shadow-red-900/20 transition-all flex flex-col items-center">
                    <span>Difícil</span>
                    <span className="text-[8px] opacity-70 mt-1">1 DIA</span>
                  </button>
                </div>
                <div className="flex items-center gap-6">
                  <button disabled={currentIndex === 0} onClick={() => { setCurrentIndex(prev => prev - 1); setIsFlipped(false); }} className="p-4 text-zinc-600 hover:text-white bg-zinc-900 rounded-full disabled:opacity-0 transition-all border border-zinc-800"><ChevronLeft size={24} /></button>
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{currentIndex + 1} / {pendingReviews.length}</span>
                  <button disabled={currentIndex === pendingReviews.length - 1} onClick={() => { setCurrentIndex(prev => prev + 1); setIsFlipped(false); }} className="p-4 text-zinc-600 hover:text-white bg-zinc-900 rounded-full disabled:opacity-0 transition-all border border-zinc-800"><ChevronRight size={24} /></button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* MODO GESTÃO DE CONTEÚDO */
        <div className="space-y-12">
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map(s => (
              <button key={s} onClick={() => setSelectedStage(selectedStage === s ? null : s)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedStage === s ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-[#141416] border-[#202023] text-zinc-500'}`}>
                {s === 1 ? 'Difícil (1d)' : s === 2 ? 'Médio (3d)' : 'Fácil (7d)'}
              </button>
            ))}
          </div>

          {Object.keys(groupedContents).length === 0 ? (
             <div className="text-center py-20 opacity-20"><BookOpen size={48} className="mx-auto mb-4" /><p className="font-black text-xs uppercase tracking-widest">Sem cards registrados</p></div>
          ) : (
            Object.entries(groupedContents).map(([subject, items]) => (
              <div key={subject} className="space-y-6">
                <div className="flex items-center gap-4 px-2">
                  <div className="h-px flex-1 bg-zinc-900"></div>
                  <h3 className="text-sm font-black text-zinc-400 uppercase tracking-[0.3em] flex items-center gap-3">{subject} <span className="text-[10px] bg-zinc-900 px-2 py-0.5 rounded text-zinc-600">{items.length} cards</span></h3>
                  <div className="h-px flex-1 bg-zinc-900"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map(item => {
                    const status = getProgressInfo(item);
                    return (
                      <div key={item.id} className={`bg-[#141416] rounded-[2.5rem] p-8 border transition-all relative overflow-hidden group ${status.isReady ? 'border-blue-600 shadow-2xl shadow-blue-900/20 scale-[1.02] z-10' : 'border-[#202023] opacity-70'}`}>
                        {status.isReady && (
                          <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1.5 rounded-bl-2xl font-black text-[9px] uppercase tracking-widest animate-pulse">
                            REVISAR AGORA
                          </div>
                        )}

                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${status.isReady ? 'bg-blue-600 text-white' : 'bg-zinc-900 text-zinc-700'}`}>
                              {status.isReady ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                            </div>
                            <div className="flex flex-col">
                              <h4 className="text-xs font-black text-white leading-tight max-w-[140px] truncate">{item.topic}</h4>
                              <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">
                                Ritmo: {item.stage === 1 ? '1 dia' : item.stage === 2 ? '3 dias' : '7 dias'}
                              </span>
                            </div>
                          </div>
                          <button onClick={() => onDeleteContent(item.id)} className="p-2 text-zinc-800 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                        </div>
                        
                        <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden mb-4 border border-zinc-800/50">
                          <div className={`h-full transition-all duration-1000 ${status.isReady ? 'bg-blue-500' : 'bg-zinc-700'}`} style={{ width: `${status.progress}%` }} />
                        </div>

                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest mb-6">
                          <span className="text-zinc-600">Ciclo Atual: {item.stage === 1 ? '24h' : item.stage === 2 ? '72h' : '168h'}</span>
                          <span className={status.isReady ? 'text-blue-500 font-black' : 'text-zinc-700'}>
                            {status.isReady ? 'PRONTO' : `EM ${Math.ceil(status.hoursLeft/24)}D`}
                          </span>
                        </div>

                        <button 
                          disabled={!status.isReady}
                          onClick={() => onUpdateStage(item.id)}
                          className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${status.isReady ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-zinc-900 text-zinc-700 cursor-not-allowed'}`}
                        >
                          Marcar como Revisado
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showAddModal && <AddModal onSave={handleAdd} onClose={() => setShowAddModal(false)} state={newTopic} setState={setNewTopic} subjects={subjects.filter(s => s !== 'Todas')} />}
    </div>
  );
};

const AddModal = ({ onSave, onClose, state, setState, subjects }: any) => (
  <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
    <div className="bg-[#141416] border border-[#202023] rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl animate-in zoom-in duration-300">
      <h2 className="text-xl font-black text-white mb-8 uppercase tracking-tight">Novo Card de Estudo</h2>
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Matéria</label>
          <input placeholder="Ex: Direito Administrativo" className="w-full bg-black border border-[#202023] p-4 rounded-2xl text-white text-sm outline-none focus:border-blue-600 font-semibold" value={state.subject} onChange={e => setState({...state, subject: e.target.value})} />
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Pergunta / Tópico</label>
          <input placeholder="O que é..." className="w-full bg-black border border-[#202023] p-4 rounded-2xl text-white text-sm outline-none focus:border-blue-600 font-semibold" value={state.topic} onChange={e => setState({...state, topic: e.target.value})} />
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Resposta / Resumo</label>
          <textarea placeholder="Explicação..." rows={4} className="w-full bg-black border border-[#202023] p-4 rounded-2xl text-white text-sm outline-none focus:border-blue-600 resize-none font-medium" value={state.notes} onChange={e => setState({...state, notes: e.target.value})} />
        </div>
      </div>
      <div className="flex gap-4 mt-10">
        <button onClick={onClose} className="flex-1 py-4 bg-zinc-900 text-zinc-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-white transition-all">Cancelar</button>
        <button onClick={onSave} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-900/20">Salvar Card</button>
      </div>
    </div>
  </div>
);

export default ReviewView;

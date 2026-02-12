
import React, { useState, useEffect, useMemo } from 'react';
import { ListTodo, Clock, Bell } from 'lucide-react';
import Sidebar from './components/Sidebar';
import CircuitView from './components/CircuitView';
import DashboardView from './components/DashboardView';
import StudySessionView from './components/StudySessionView';
import SimuladosView from './components/SimuladosView';
import ReviewView from './components/ReviewView';
import { ViewType, CircuitItem, StudyStatus, Profile, Simulado, ReviewContent, WrongQuestion } from './types';
import { INITIAL_CIRCUIT } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('circuit');
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const saved = localStorage.getItem('lima_loop_profiles');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((p: any) => ({
        ...p,
        reviewContents: p.reviewContents || [],
        wrongQuestions: p.wrongQuestions || [],
        circuit: (p.circuit || []).map((c: any) => ({ ...c, studyCount: c.studyCount || 0 }))
      }));
    }
    return [{
      id: 'default',
      name: 'Plano INSS',
      circuit: INITIAL_CIRCUIT.map(item => ({ ...item, studyCount: 0 })),
      performanceData: [],
      simulados: [],
      reviewContents: [],
      wrongQuestions: []
    }];
  });
  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    return localStorage.getItem('lima_loop_active_id') || 'default';
  });
  const [currentSessionSeconds, setCurrentSessionSeconds] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const cuiabaDate = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Cuiaba',
    day: '2-digit',
    month: 'short',
  }).format(currentTime);

  const cuiabaTime = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Cuiaba',
    hour: '2-digit',
    minute: '2-digit',
  }).format(currentTime).replace(':', 'h ');

  useEffect(() => {
    localStorage.setItem('lima_loop_profiles', JSON.stringify(profiles));
    localStorage.setItem('lima_loop_active_id', activeProfileId);
  }, [profiles, activeProfileId]);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  // Cálculo de revisões pendentes
  const pendingReviewCount = useMemo(() => {
    const INTERVALS_HOURS = [0, 24, 72, 168];
    return activeProfile.reviewContents.filter(item => {
      const last = new Date(item.lastReviewDate).getTime();
      const now = new Date().getTime();
      const diffHours = (now - last) / (1000 * 60 * 60);
      const targetHours = INTERVALS_HOURS[item.stage] || 24;
      return diffHours >= targetHours;
    }).length;
  }, [activeProfile.reviewContents, currentTime]);

  const updateActiveProfile = (updater: (p: Profile) => Profile) => {
    setProfiles(prev => prev.map(p => p.id === activeProfileId ? updater(p) : p));
  };

  const handleAddReviewContent = (content: Omit<ReviewContent, 'id' | 'createdAt' | 'lastReviewDate' | 'stage'>) => {
    const dateToMakePending = new Date();
    dateToMakePending.setHours(dateToMakePending.getHours() - 25);

    updateActiveProfile(p => ({
      ...p,
      reviewContents: [
        ...p.reviewContents,
        {
          ...content,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
          lastReviewDate: dateToMakePending.toISOString(),
          stage: 1
        }
      ]
    }));
  };

  const handleUpdateReviewStage = (id: string, customStage?: number) => {
    updateActiveProfile(p => ({
      ...p,
      reviewContents: p.reviewContents.map(rev => 
        rev.id === id ? { 
          ...rev, 
          stage: customStage !== undefined ? customStage : (rev.stage < 4 ? rev.stage + 1 : 4), 
          lastReviewDate: new Date().toISOString() 
        } : rev
      )
    }));
  };

  const handleDeleteReviewContent = (id: string) => {
    updateActiveProfile(p => ({
      ...p,
      reviewContents: p.reviewContents.filter(rev => rev.id !== id)
    }));
  };

  const handleCreateProfile = (name: string) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newProfile: Profile = {
      id: newId,
      name,
      circuit: [],
      performanceData: [],
      simulados: [],
      reviewContents: [],
      wrongQuestions: []
    };
    setProfiles([...profiles, newProfile]);
    setActiveProfileId(newId);
    setCurrentView('circuit');
  };

  const handleDeleteProfile = (id: string) => {
    setProfiles(prev => {
      if (prev.length <= 1) {
        alert("Você precisa de pelo menos um plano ativo.");
        return prev;
      }
      const newProfiles = prev.filter(p => p.id !== id);
      if (activeProfileId === id) {
        setActiveProfileId(newProfiles[0].id);
      }
      return newProfiles;
    });
  };

  const handleAddSubject = (name: string) => {
    updateActiveProfile(p => {
      const newItem: CircuitItem = {
        id: Math.random().toString(36).substr(2, 9),
        subjectName: name,
        status: p.circuit.length === 0 ? StudyStatus.NEXT : StudyStatus.PENDING,
        studyCount: 0
      };
      return { ...p, circuit: [...p.circuit, newItem] };
    });
  };

  const handleAddSimulado = (simData: Omit<Simulado, 'id'>) => {
    updateActiveProfile(p => ({
      ...p,
      simulados: [...p.simulados, { ...simData, id: Math.random().toString(36).substr(2, 9) }]
    }));
  };

  const handleDeleteSimulado = (id: string) => {
    updateActiveProfile(p => ({
      ...p,
      simulados: p.simulados.filter(s => s.id !== id)
    }));
  };

  const handleMove = (id: string, direction: 'up' | 'down') => {
    updateActiveProfile(p => {
      const newCircuit = [...p.circuit];
      const index = newCircuit.findIndex(item => item.id === id);
      if (direction === 'up' && index > 0) {
        [newCircuit[index - 1], newCircuit[index]] = [newCircuit[index], newCircuit[index - 1]];
      } else if (direction === 'down' && index < newCircuit.length - 1) {
        [newCircuit[index + 1], newCircuit[index]] = [newCircuit[index], newCircuit[index + 1]];
      }
      return { ...p, circuit: newCircuit };
    });
  };

  const handleDuplicate = (id: string) => {
    updateActiveProfile(p => {
      const index = p.circuit.findIndex(item => item.id === id);
      if (index === -1) return p;
      const itemToDuplicate = p.circuit[index];
      const newItem = {
        ...itemToDuplicate,
        id: Math.random().toString(36).substr(2, 9),
        status: StudyStatus.PENDING,
        studyCount: 0
      };
      const newCircuit = [...p.circuit];
      newCircuit.splice(index + 1, 0, newItem);
      return { ...p, circuit: newCircuit };
    });
  };

  const handleDeleteSubject = (id: string) => {
    updateActiveProfile(p => {
      if (p.circuit.length <= 1) return p;
      let newCircuit = p.circuit.filter(item => item.id !== id);
      if (!newCircuit.some(i => i.status === StudyStatus.NEXT)) {
          if (newCircuit.length > 0) newCircuit[0].status = StudyStatus.NEXT;
      }
      return { ...p, circuit: newCircuit };
    });
  };

  const handleReset = () => {
    if(!confirm("Isso apagará todo seu histórico deste plano. Deseja continuar?")) return;
    updateActiveProfile(p => ({
      ...p,
      circuit: p.circuit.map((item, idx) => ({
        ...item,
        status: idx === 0 ? StudyStatus.NEXT : StudyStatus.PENDING,
        studyCount: 0
      })),
      performanceData: [],
      simulados: [],
      reviewContents: [],
      wrongQuestions: []
    }));
    setCurrentSessionSeconds(0);
    setCurrentView('circuit');
  };

  const handleStartStudy = () => {
    if (activeProfile.circuit.length === 0) {
      alert("Adicione matérias ao seu ciclo antes de iniciar.");
      return;
    }
    setCurrentSessionSeconds(0);
    setCurrentView('timer');
  };

  const handleSessionFinish = (data: any) => {
    const currentNext = activeProfile.circuit.find(i => i.status === StudyStatus.NEXT) || activeProfile.circuit[0];
    const newStat = {
      name: currentNext.subjectName,
      correct: data.correct,
      total: data.questions,
      duration: data.duration,
      notes: data.notes,
      date: new Date().toLocaleDateString()
    };
    updateActiveProfile(p => ({
      ...p,
      performanceData: [...p.performanceData, newStat]
    }));
    setCurrentView('dashboard');
    setCurrentSessionSeconds(0);
  };

  const handleSessionFinishAndNext = (data: any) => {
    const currentNextIndex = activeProfile.circuit.findIndex(i => i.status === StudyStatus.NEXT);
    if (currentNextIndex !== -1) {
      const currentSubject = activeProfile.circuit[currentNextIndex];
      const newStat = {
        name: currentSubject.subjectName,
        correct: data.correct,
        total: data.questions,
        duration: data.duration,
        notes: data.notes,
        date: new Date().toLocaleDateString()
      };

      if (data.notes) {
        handleAddReviewContent({
          subject: currentSubject.subjectName,
          topic: "Sessão de Ciclo",
          notes: data.notes
        });
      }

      updateActiveProfile(p => {
        const newCircuit = [...p.circuit];
        newCircuit.forEach(i => {
          if (i.status === StudyStatus.LAST_STUDIED) i.status = StudyStatus.PENDING;
        });
        
        // Incrementar contador de estudos e atualizar status
        const item = newCircuit[currentNextIndex];
        item.status = StudyStatus.LAST_STUDIED;
        item.studyCount = (item.studyCount || 0) + 1;
        
        const nextIndex = (currentNextIndex + 1) % newCircuit.length;
        newCircuit.forEach((item, idx) => {
            if (idx === nextIndex) {
                item.status = StudyStatus.NEXT;
            } else if (item.status === StudyStatus.NEXT) {
                item.status = StudyStatus.PENDING;
            }
        });
        return {
          ...p,
          circuit: newCircuit,
          performanceData: [...p.performanceData, newStat]
        };
      });
    }
    setCurrentSessionSeconds(0);
    setCurrentView('circuit');
  };

  const handleTimerFinish = (seconds: number) => {
    setCurrentSessionSeconds(seconds);
    setCurrentView('summary');
  };

  const activeItem = activeProfile.circuit.find(item => item.status === StudyStatus.NEXT) || activeProfile.circuit[0];
  const activeIndex = activeProfile.circuit.indexOf(activeItem);
  const nextItem = activeProfile.circuit[(activeIndex + 1) % activeProfile.circuit.length];

  const getLastNotesForSubject = (subjectName: string) => {
    const history = [...activeProfile.performanceData].reverse();
    const lastSession = history.find(s => s.name === subjectName);
    return lastSession?.notes || "Nenhum conteúdo registrado anteriormente";
  };

  const renderContent = () => {
    switch (currentView) {
      case 'circuit':
        return (
          <CircuitView 
            items={activeProfile.circuit} 
            profileName={activeProfile.name}
            onDuplicate={handleDuplicate}
            onDelete={handleDeleteSubject}
            onReset={handleReset}
            onAdd={handleAddSubject}
            onMove={handleMove}
            onStartStudy={handleStartStudy}
          />
        );
      case 'simulados':
        return (
          <SimuladosView 
            simulados={activeProfile.simulados}
            onAddSimulado={handleAddSimulado}
            onDeleteSimulado={handleDeleteSimulado}
          />
        );
      case 'review':
        return (
          <ReviewView 
            reviewContents={activeProfile.reviewContents}
            onAddContent={handleAddReviewContent}
            onUpdateStage={handleUpdateReviewStage}
            onDeleteContent={handleDeleteReviewContent}
          />
        );
      case 'timer':
        return (
          <StudySessionView 
            mode="timer"
            activeSubject={activeItem}
            nextSubject={nextItem}
            profileName={activeProfile.name}
            previousNotes={getLastNotesForSubject(activeItem.subjectName)}
            onFinish={() => {}} 
            onFinishAndNext={() => {}}
            onCancel={handleTimerFinish}
          />
        );
      case 'summary':
        return (
          <StudySessionView 
            mode="summary"
            activeSubject={activeItem}
            nextSubject={nextItem}
            profileName={activeProfile.name}
            initialSeconds={currentSessionSeconds}
            previousNotes={getLastNotesForSubject(activeItem.subjectName)}
            onFinish={handleSessionFinish}
            onFinishAndNext={handleSessionFinishAndNext}
            onCancel={() => setCurrentView('circuit')}
          />
        );
      case 'dashboard':
        return <DashboardView stats={activeProfile.performanceData} />;
      case 'activity':
        return (
          <div className="flex flex-col items-center py-10 px-6 max-w-5xl mx-auto">
            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Histórico de Atividade</h2>
            <p className="text-sm text-zinc-500 mb-10 font-medium">Reveja cada passo da sua jornada de estudos.</p>
            <div className="w-full space-y-4">
              {activeProfile.performanceData.slice().reverse().map((s, i) => (
                <div key={i} className="bg-[#141416] p-6 rounded-[2rem] border border-[#202023] shadow-sm flex flex-col hover:border-blue-500/50 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-500 font-bold border border-blue-500/10">
                        {s.name.substring(0, 1)}
                      </div>
                      <div>
                        <span className="font-black text-white block text-lg">{s.name}</span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{s.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-blue-500 font-black text-xl">{s.correct}/{s.total} <span className="text-xs text-zinc-600">itens</span></div>
                      <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">{(s.duration / 60).toFixed(0)} min cronometrados</div>
                    </div>
                  </div>
                  {s.notes && (
                    <div className="mt-4 text-sm text-zinc-400 bg-black/20 p-4 rounded-2xl border-l-4 border-blue-600 font-medium italic">
                      "{s.notes}"
                    </div>
                  )}
                </div>
              ))}
              {activeProfile.performanceData.length === 0 && (
                <div className="text-center py-20 opacity-20 flex flex-col items-center text-zinc-500">
                   <ListTodo size={64} />
                   <p className="mt-4 font-black text-xl uppercase tracking-widest">Nenhuma atividade registrada</p>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return <div className="p-20 text-center opacity-30 font-bold text-xl uppercase tracking-widest text-zinc-600">Em Breve</div>;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0b]">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSwitchProfile={setActiveProfileId}
        onCreateProfile={handleCreateProfile}
        onDeleteProfile={handleDeleteProfile}
        pendingReviewCount={pendingReviewCount}
      />
      
      <main className="flex-1 ml-64 min-h-screen">
        <header className="h-20 bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-[#202023] flex items-center justify-between px-10 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-blue-900/20 text-blue-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-blue-500/10">Plano Ativo</div>
            <span className="text-lg font-black text-white tracking-tight">{activeProfile.name}</span>
          </div>
          
          <div className="flex items-center gap-8">
            {pendingReviewCount > 0 && (
              <div className="hidden md:flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 rounded-xl border border-red-500/20 animate-pulse">
                <Bell size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">{pendingReviewCount} REVISÕES PENDENTES</span>
              </div>
            )}

            <div className="flex items-center gap-6">
              {currentView === 'circuit' && (
                <button 
                  onClick={handleStartStudy}
                  className="bg-blue-600 text-white px-8 py-2.5 rounded-2xl text-xs font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-950/20 active:scale-95 uppercase tracking-widest"
                >
                  Iniciar Estudo
                </button>
              )}
              <div className="flex items-center gap-4 border-l border-[#202023] pl-6">
                <div className="text-right">
                  <div className="text-sm font-black text-white leading-tight tabular-nums">{cuiabaTime}</div>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                    Cuiabá, MT • {cuiabaDate}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="animate-in fade-in duration-500 pb-20">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;

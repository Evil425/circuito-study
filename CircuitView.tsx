
import React, { useState } from 'react';
import { Copy, Trash2, ChevronRight, Plus, ChevronUp, ChevronDown, RotateCcw, Play, Zap, CheckCircle } from 'lucide-react';
import { CircuitItem, StudyStatus } from './types';


interface CircuitViewProps {
  items: CircuitItem[];
  profileName: string;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onReset: () => void;
  onAdd: (name: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onStartStudy: () => void;
}

const CircuitView: React.FC<CircuitViewProps> = ({ items, profileName, onDuplicate, onDelete, onReset, onAdd, onMove, onStartStudy }) => {
  const [newSubjectName, setNewSubjectName] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);

  const handleAdd = () => {
    if (newSubjectName.trim()) {
      onAdd(newSubjectName.trim());
      setNewSubjectName('');
      setShowAddInput(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
             <h1 className="text-4xl font-black text-white tracking-tighter">Ciclo Mestre</h1>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] ml-5">{profileName}</p>
        </div>
        
        <div className="flex items-center gap-4">
            <button 
                onClick={() => setShowAddInput(!showAddInput)}
                className="flex items-center gap-3 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 active:scale-95"
            >
                <Plus size={16} /> Adicionar Matéria
            </button>
            <button 
                onClick={onStartStudy}
                className="flex items-center gap-4 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-2xl shadow-blue-600/20 active:scale-95 group"
            >
                <Play size={16} className="fill-white" /> Iniciar Estudo
            </button>
        </div>
      </div>

      {showAddInput && (
        <div className="mb-10 p-8 rounded-[2.5rem] border border-blue-500/20 bg-blue-500/5 backdrop-blur-xl animate-in slide-in-from-top duration-500 flex gap-4">
            <input 
                autoFocus
                type="text"
                placeholder="Nome da disciplina (ex: Informática)..."
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-blue-500 outline-none transition-all placeholder-zinc-700 font-bold"
            />
            <button 
                onClick={handleAdd}
                className="bg-blue-600 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 shadow-xl active:scale-95"
            >
                Salvar
            </button>
        </div>
      )}

      <div className="bg-[#0c0c0e] rounded-[3rem] p-12 border border-white/5 shadow-2xl relative overflow-hidden group/container">
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover/container:opacity-[0.05] transition-opacity">
            <Zap size={240} />
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 text-zinc-800">
            <div className="w-20 h-20 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                <Plus size={32} className="opacity-20" />
            </div>
            <p className="font-black text-xs uppercase tracking-widest opacity-40">Nenhuma disciplina vinculada ao ciclo</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
            {items.map((item, idx) => (
              <div key={item.id} className="relative group">
                <div className={`flex items-center justify-between p-6 rounded-[2rem] border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${
                  item.status === StudyStatus.LAST_STUDIED ? 'border-emerald-500/10 bg-emerald-500/[0.02]' : 
                  item.status === StudyStatus.NEXT ? 'border-blue-600/40 bg-blue-600/5 shadow-2xl shadow-blue-600/10 ring-1 ring-blue-600/20' : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                }`}>
                  <div className="flex items-center gap-5">
                    <div className="flex flex-col items-center">
                      <button 
                          onClick={() => onMove(item.id, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-zinc-700 hover:text-blue-500 disabled:opacity-0 transition-colors"
                      >
                          <ChevronUp size={16} />
                      </button>
                      <span className="text-[11px] font-black text-zinc-600 leading-none py-1">{idx + 1}</span>
                      <button 
                          onClick={() => onMove(item.id, 'down')}
                          disabled={idx === items.length - 1}
                          className="p-1 text-zinc-700 hover:text-blue-500 disabled:opacity-0 transition-colors"
                      >
                          <ChevronDown size={16} />
                      </button>
                    </div>
                    
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3">
                        <h4 className={`text-base font-black tracking-tight ${item.status === StudyStatus.NEXT ? 'text-blue-500' : 'text-zinc-200'}`}>
                          {item.subjectName}
                        </h4>
                        {item.studyCount && item.studyCount > 0 ? (
                           <div className="flex items-center gap-1.5 bg-zinc-900/50 px-2 py-0.5 rounded-lg border border-white/5">
                              <CheckCircle size={10} className="text-emerald-500" />
                              <span className="text-[9px] font-black text-zinc-500 uppercase tabular-nums">{item.studyCount}x</span>
                           </div>
                        ) : null}
                      </div>
                      <div className="flex gap-2 mt-2">
                        {item.status === StudyStatus.LAST_STUDIED && (
                          <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 uppercase tracking-widest border border-emerald-500/20">Concluído</span>
                        )}
                        {item.status === StudyStatus.NEXT && (
                          <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-blue-600 text-white uppercase tracking-widest animate-pulse shadow-lg shadow-blue-600/40">Atual</span>
                        )}
                        {item.status === StudyStatus.PENDING && (
                          <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-600 uppercase tracking-widest border border-white/5">Aguardando</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => onDuplicate(item.id)}
                      title="Duplicar"
                      className="p-3 text-zinc-600 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"
                    >
                      <Copy size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(item.id)}
                      title="Excluir"
                      className="p-3 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap gap-4 justify-between items-center">
          <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-3">
             <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
             {items.length} Matérias no Ciclo
          </div>
          <button 
            onClick={onReset}
            className="flex items-center gap-3 px-8 py-4 bg-transparent text-zinc-500 text-[10px] font-black rounded-2xl hover:bg-red-500/5 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20 uppercase tracking-widest active:scale-95"
          >
            <RotateCcw size={14} /> Resetar Todo o Ciclo
          </button>
        </div>
      </div>
    </div>
  );
};

export default CircuitView;

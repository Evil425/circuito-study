
import React, { useState } from 'react';
import { LayoutDashboard, ListTodo, FileText, Plus, Users, Trash2, PlayCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { ViewType, Profile } from '../types';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  profiles: Profile[];
  activeProfileId: string;
  onSwitchProfile: (id: string) => void;
  onCreateProfile: (name: string) => void;
  onDeleteProfile: (id: string) => void;
  pendingReviewCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setView, 
  profiles, 
  activeProfileId, 
  onSwitchProfile, 
  onCreateProfile,
  onDeleteProfile,
  pendingReviewCount
}) => {
  const [showNewProfileInput, setShowNewProfileInput] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'activity', label: 'Histórico', icon: ListTodo },
    { id: 'review', label: 'Revisões', icon: RefreshCw, badge: pendingReviewCount },
    { id: 'simulados', label: 'Simulados', icon: FileText },
    { id: 'circuit', label: 'Ciclo Mestre', icon: PlayCircle },
  ];

  const handleAddProfile = () => {
    if (newProfileName.trim()) {
      onCreateProfile(newProfileName.trim());
      setNewProfileName('');
      setShowNewProfileInput(false);
    }
  };

  return (
    <div className="w-64 h-screen bg-[#050505] border-r border-white/5 flex flex-col fixed left-0 top-0 z-20 overflow-hidden">
      <div className="p-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/20">
          L
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-black text-white leading-tight tracking-tighter">LIMA</h1>
          <h2 className="text-[10px] font-bold text-blue-500 tracking-[0.3em] uppercase opacity-80">Loop</h2>
        </div>
      </div>

      <div className="px-6 mb-8">
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Meus Planos</span>
          <button 
            onClick={() => setShowNewProfileInput(!showNewProfileInput)}
            className="p-1.5 hover:bg-zinc-800/50 text-blue-500 rounded-lg transition-all border border-transparent hover:border-white/5"
          >
            <Plus size={14} />
          </button>
        </div>
        
        {showNewProfileInput && (
          <div className="px-2 mb-4 animate-in slide-in-from-top duration-300">
            <input 
              autoFocus
              className="w-full text-xs p-3 bg-zinc-900/50 border border-white/5 rounded-xl outline-none focus:border-blue-500/50 text-white placeholder-zinc-700 font-bold"
              placeholder="Nome do Ciclo..."
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddProfile()}
            />
          </div>
        )}

        <div className="space-y-1.5 max-h-[180px] overflow-y-auto scrollbar-hide">
          {profiles.map(profile => (
            <div 
              key={profile.id}
              className={`group flex items-center justify-between px-4 py-3 text-xs font-bold rounded-xl cursor-pointer transition-all ${
                activeProfileId === profile.id 
                  ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20 shadow-inner' 
                  : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
              }`}
              onClick={() => onSwitchProfile(profile.id)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <Users size={14} className={activeProfileId === profile.id ? 'text-blue-500' : 'text-zinc-700'} />
                <span className="truncate tracking-tight">{profile.name}</span>
              </div>
              {profiles.length > 1 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if(window.confirm(`Excluir plano "${profile.name}"?`)) onDeleteProfile(profile.id);
                  }}
                  className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <nav className="flex-1 px-6 space-y-1.5">
        <span className="block px-2 mb-3 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Navegação</span>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewType)}
              className={`w-full flex items-center justify-between px-4 py-3.5 text-xs font-bold rounded-xl transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/30 translate-x-1' 
                  : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <Icon size={18} className={isActive ? 'text-white' : 'text-zinc-600 group-hover:text-zinc-400'} />
                {item.label}
              </div>
              
              {item.badge && item.badge > 0 ? (
                <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[9px] font-black ${
                  isActive ? 'bg-white text-blue-600' : 'bg-red-500 text-white animate-bounce shadow-lg shadow-red-500/30'
                }`}>
                  {item.badge}
                </span>
              ) : isActive && (
                <ChevronRight size={14} className="opacity-40" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-8">
        <div className="bg-gradient-to-r from-zinc-900/50 to-zinc-900 rounded-2xl p-4 border border-white/5 text-center group cursor-help overflow-hidden relative">
            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] group-hover:text-blue-400 transition-colors">Sistema Alpha</p>
            <div className="mt-2 flex justify-center gap-1">
                <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
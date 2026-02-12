
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, Target, TrendingUp, Brain, Info, Clock, Activity, Zap } from 'lucide-react';
import { getStudyInsights } from './geminiService';

interface DashboardViewProps {
  stats: any[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ stats }) => {
  const [insights, setInsights] = useState<string>("Iniciando diagnóstico por inteligência artificial...");

  useEffect(() => {
    if (stats.length === 0) {
      setInsights("Aguardando sua primeira sessão de estudos para gerar análise preditiva de desempenho.");
      return;
    }
    const loadInsights = async () => {
      const text = await getStudyInsights(stats);
      setInsights(text || "Diagnóstico não disponível no momento.");
    };
    loadInsights();
  }, [stats]);

  const aggregateData = () => {
    if (stats.length === 0) return [];
    const map = new Map();
    stats.forEach(s => {
      if (!map.has(s.name)) {
        map.set(s.name, { name: s.name, correct: 0, total: 0 });
      }
      const existing = map.get(s.name);
      existing.correct += s.correct;
      existing.total += s.total;
    });
    return Array.from(map.values()).map(item => ({
      ...item,
      labelName: item.name.length > 12 ? item.name.substring(0, 10) + '...' : item.name,
      percentage: Math.round((item.correct / item.total) * 100)
    }));
  };

  const chartData = aggregateData();
  const totalCorrect = stats.reduce((acc, curr) => acc + curr.correct, 0);
  const totalQuestions = stats.reduce((acc, curr) => acc + curr.total, 0);
  const totalSeconds = stats.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  
  const formatTotalTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const overallPrecision = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto py-12 px-8 space-y-12 animate-in fade-in duration-1000">
      <div className="flex items-center gap-4 mb-2">
         <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
            <Activity size={20} />
         </div>
         <h1 className="text-3xl font-black text-white tracking-tighter">Performance Analítica</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard icon={<Target size={20} />} color="blue" label="Precisão Geral" value={`${overallPrecision}%`} subValue="Frequência de acertos" />
        <StatCard icon={<Clock size={20} />} color="zinc" label="Tempo Líquido" value={formatTotalTime(totalSeconds)} subValue="Total cronometrado" />
        <StatCard icon={<Trophy size={20} />} color="emerald" label="Itens" value={totalQuestions.toString()} subValue="Questões respondidas" />
        <StatCard icon={<TrendingUp size={20} />} color="amber" label="Sessões" value={stats.length.toString()} subValue="Ciclos finalizados" />
        <StatCard icon={<Zap size={20} />} color="purple" label="Produtividade" value={stats.length > 0 ? "Alta" : "--"} subValue="Ritmo de estudos" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-[#0c0c0e] p-12 rounded-[3rem] border border-white/5 shadow-2xl">
          <div className="flex justify-between items-center mb-12">
            <div>
                <h3 className="text-xl font-black text-white tracking-tight">Evolução Disciplinar</h3>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Comparativo de acertos em %</p>
            </div>
          </div>
          <div className="h-80 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f1f22" opacity={0.3} />
                  <XAxis 
                    dataKey="labelName" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#52525b', fontWeight: 'bold' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#3f3f46' }} 
                    domain={[0, 100]} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#ffffff05', radius: 10 }}
                    contentStyle={{ backgroundColor: '#141416', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'black', color: '#3b82f6' }}
                    labelStyle={{ fontWeight: 'black', marginBottom: '8px', color: '#71717a', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}
                  />
                  <Bar dataKey="percentage" radius={[12, 12, 12, 12]} barSize={45}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.percentage > 80 ? '#10b981' : entry.percentage > 60 ? '#3b82f6' : '#27272a'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-800">
                <p className="font-black text-xs uppercase tracking-[0.3em] opacity-30">Aguardando inserção de dados</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600/10 to-transparent backdrop-blur-3xl rounded-[3rem] p-12 border border-white/5 shadow-2xl flex flex-col relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
            <Brain size={180} />
          </div>
          
          <div className="flex items-center gap-5 mb-10">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-600/40">
              <Brain size={28} />
            </div>
            <div>
              <h3 className="font-black text-lg text-white tracking-tight uppercase">Mentor IA</h3>
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Diagnóstico Estratégico</span>
            </div>
          </div>

          <div className="flex-1 text-sm leading-relaxed whitespace-pre-wrap font-bold overflow-y-auto pr-4 scrollbar-hide text-zinc-400 italic">
            "{insights}"
          </div>

          <div className="mt-12 pt-8 border-t border-white/5">
             <button className="w-full py-5 bg-white text-black hover:bg-zinc-200 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95">
                Atualizar Insights
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, subValue: string, color: string }> = ({ icon, label, value, subValue, color }) => {
    const colorClasses = {
        blue: 'text-blue-500 bg-blue-500/5 border-blue-500/10',
        emerald: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10',
        amber: 'text-amber-500 bg-amber-500/5 border-amber-500/10',
        purple: 'text-purple-500 bg-purple-500/5 border-purple-500/10',
        zinc: 'text-zinc-500 bg-zinc-500/5 border-white/5'
    }[color] || 'text-zinc-500 bg-zinc-900 border-white/5';

    return (
        <div className="bg-[#0c0c0e] p-8 rounded-[2.5rem] border border-white/5 shadow-xl hover:border-white/10 transition-all hover:-translate-y-1">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${colorClasses}`}>
                {icon}
            </div>
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1 block">{label}</span>
            <div className="text-3xl font-black text-white tracking-tighter mb-1">{value}</div>
            <div className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">{subValue}</div>
        </div>
    );
};

export default DashboardView;

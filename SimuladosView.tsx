
import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Trash2, TrendingUp, Award, Percent, Info, LineChart as ChartIcon, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Simulado } from '../types';
import { getSimuladoAnalysis } from './geminiService';

interface SimuladosViewProps {
  simulados: Simulado[];
  onAddSimulado: (simulado: Omit<Simulado, 'id'>) => void;
  onDeleteSimulado: (id: string) => void;
}

const SimuladosView: React.FC<SimuladosViewProps> = ({ simulados, onAddSimulado, onDeleteSimulado }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [total, setTotal] = useState('');
  const [correct, setCorrect] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState('Analisando seu desempenho...');
  const [loadingAi, setLoadingAi] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (simulados.length > 0) {
      setLoadingAi(true);
      getSimuladoAnalysis(simulados).then(res => {
        setAiAnalysis(res);
        setLoadingAi(false);
      });
    } else {
      setAiAnalysis("Sua chance de aprovação aparecerá aqui após o primeiro simulado.");
    }
  }, [simulados]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const nTotal = Number(total);
    const nCorrect = Number(correct);
    if (!name || !total || !correct) {
      setError("Preencha todos os campos.");
      return;
    }
    if (nCorrect > nTotal) {
      setError("Os acertos não podem superar o total.");
      return;
    }
    onAddSimulado({
      name,
      totalQuestions: nTotal,
      correctAnswers: nCorrect,
      date: new Date().toLocaleDateString()
    });
    setName('');
    setTotal('');
    setCorrect('');
    setShowAdd(false);
  };

  const chartData = simulados.map(s => ({
    name: s.name.length > 10 ? s.name.substring(0, 8) + '...' : s.name,
    fullName: s.name,
    percent: Math.round((s.correctAnswers / s.totalQuestions) * 100),
    date: s.date
  }));

  const avgPercent = simulados.length > 0 
    ? Math.round((simulados.reduce((acc, s) => acc + (s.correctAnswers / s.totalQuestions), 0) / simulados.length) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Centro de Simulados</h1>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Estatísticas de alta performance</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className={`px-8 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shadow-xl active:scale-95 uppercase tracking-widest ${showAdd ? 'bg-zinc-800 text-zinc-400' : 'bg-blue-600 text-white shadow-blue-900/10'}`}
        >
          {showAdd ? 'Cancelar' : <><Plus size={16} /> Registrar Prova</>}
        </button>
      </div>

      {showAdd && (
        <div className="space-y-4 animate-in slide-in-from-top duration-300">
          {error && (
            <div className="bg-red-500/10 text-red-500 p-4 rounded-xl text-[10px] font-black flex items-center gap-2 border border-red-500/20 uppercase tracking-widest">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="bg-[#141416] p-10 rounded-[2.5rem] border border-[#202023] shadow-2xl flex flex-wrap md:flex-nowrap gap-6 items-end">
            <div className="flex-1 min-w-[250px] space-y-3">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Instituição / Nome do Simulado</label>
              <input 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Simulado Nacional PF/PRF"
                className="w-full bg-zinc-900 border border-[#202023] focus:border-blue-600 rounded-2xl p-4 text-sm font-semibold text-white outline-none transition-all placeholder-zinc-700"
              />
            </div>
            <div className="w-full md:w-36 space-y-3">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Questões</label>
              <input 
                type="number"
                value={total}
                onChange={e => setTotal(e.target.value)}
                className="w-full bg-zinc-900 border border-[#202023] focus:border-blue-600 rounded-2xl p-4 text-sm font-semibold text-white outline-none transition-all"
              />
            </div>
            <div className="w-full md:w-36 space-y-3">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Acertos</label>
              <input 
                type="number"
                value={correct}
                onChange={e => setCorrect(e.target.value)}
                className="w-full bg-zinc-900 border border-[#202023] focus:border-blue-600 rounded-2xl p-4 text-sm font-semibold text-white outline-none transition-all"
              />
            </div>
            <button type="submit" className="w-full md:w-auto bg-blue-600 text-white px-10 py-5 rounded-2xl text-xs font-black hover:bg-blue-700 transition-all shadow-lg active:scale-95 uppercase tracking-widest">
              Registrar
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#141416] p-8 rounded-[2.5rem] border border-[#202023] shadow-sm flex flex-col items-center text-center group hover:border-blue-600/30 transition-colors">
              <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-400 mb-4 border border-[#202023]">
                <Percent size={20} />
              </div>
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter">Média Geral</span>
              <div className="text-3xl font-black text-white">{avgPercent}%</div>
            </div>

            <div className="bg-[#141416] p-8 rounded-[2.5rem] border border-[#202023] shadow-sm flex flex-col items-center text-center group hover:border-blue-600/30 transition-colors">
              <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-400 mb-4 border border-[#202023]">
                <Award size={20} />
              </div>
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter">Provas</span>
              <div className="text-3xl font-black text-white">{simulados.length}</div>
            </div>
          </div>

          <div className={`p-10 rounded-[3rem] border transition-all flex flex-col min-h-[420px] relative overflow-hidden ${loadingAi ? 'bg-zinc-900 opacity-60' : 'bg-black border-[#202023] text-white'}`}>
            <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
                    <TrendingUp size={24} className="text-white" />
                </div>
                <div>
                    <h3 className="font-black text-lg leading-tight text-white uppercase tracking-tight">Chance Real</h3>
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Lima Loop IA Analysis</span>
                </div>
                </div>
                
                <div className="flex-1 text-sm leading-relaxed overflow-y-auto pr-2 scrollbar-hide text-zinc-400 font-medium">
                {loadingAi ? (
                    <div className="flex flex-col items-center justify-center h-48 space-y-4">
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="whitespace-pre-wrap antialiased italic">
                    {aiAnalysis}
                    </div>
                )}
                </div>
            </div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl"></div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="bg-[#141416] p-10 rounded-[2.5rem] border border-[#202023] shadow-sm">
            <h3 className="font-black text-lg text-white mb-8 uppercase tracking-tight flex items-center gap-3">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
              Curva de Aproveitamento
            </h3>
            <div className="h-64">
              {simulados.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f1f22" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fill: '#52525b', fontWeight: 'bold' }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fill: '#3f3f46' }} 
                      domain={[0, 100]} 
                    />
                    <Tooltip 
                      cursor={{ fill: '#0a0a0b' }}
                      contentStyle={{ backgroundColor: '#141416', borderRadius: '16px', border: '1px solid #27272a', padding: '15px' }}
                      itemStyle={{ color: '#fff', fontSize: '11px' }}
                    />
                    <Bar dataKey="percent" radius={[6, 6, 0, 0]} barSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.percent >= 80 ? '#2563eb' : entry.percent >= 60 ? '#3b82f6' : '#1e1e1e'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-5 text-white">
                   <ChartIcon size={56} />
                   <p className="text-sm font-black mt-4 uppercase tracking-widest">Sem registros</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#141416] rounded-[2.5rem] border border-[#202023] shadow-sm overflow-hidden">
            <div className="px-10 py-8 border-b border-[#202023] flex justify-between items-center bg-zinc-900/20">
              <h3 className="font-black text-lg text-white flex items-center gap-3 tracking-tight">
                <ClipboardList size={20} className="text-blue-600" />
                Histórico de Provas
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black/20">
                  <tr>
                    <th className="px-10 py-5 text-[9px] font-black text-zinc-600 uppercase tracking-widest">Simulado</th>
                    <th className="px-10 py-5 text-[9px] font-black text-zinc-600 uppercase tracking-widest">Data</th>
                    <th className="px-10 py-5 text-[9px] font-black text-zinc-600 uppercase tracking-widest">Desempenho</th>
                    <th className="px-10 py-5 text-[9px] font-black text-zinc-600 uppercase tracking-widest text-center">Remover</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#202023]">
                  {simulados.map(s => {
                    const percent = Math.round((s.correctAnswers / s.totalQuestions) * 100);
                    return (
                      <tr key={s.id} className="hover:bg-zinc-900/30 transition-colors group">
                        <td className="px-10 py-6">
                          <span className="text-sm font-black text-white block leading-tight">{s.name}</span>
                          <span className="text-[9px] text-zinc-700 font-bold uppercase mt-1 block">ID: {s.id.substring(0,8)}</span>
                        </td>
                        <td className="px-10 py-6 text-[11px] font-semibold text-zinc-500">{s.date}</td>
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="flex-1 w-32 h-2 bg-zinc-900 rounded-full overflow-hidden border border-[#202023]">
                              <div 
                                className={`h-full rounded-full transition-all duration-700 ${percent >= 80 ? 'bg-blue-500' : percent >= 60 ? 'bg-blue-600' : 'bg-zinc-800'}`} 
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="text-sm font-black text-white whitespace-nowrap">{percent}%</span>
                          </div>
                        </td>
                        <td className="px-10 py-6 text-center">
                          <button 
                            onClick={() => onDeleteSimulado(s.id)}
                            className="p-3 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {simulados.length === 0 && (
                <div className="p-16 text-center text-zinc-800 font-black text-xs uppercase tracking-widest">Nenhum registro encontrado</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimuladosView;

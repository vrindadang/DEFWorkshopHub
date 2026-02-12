
import React from 'react';
import { Workshop } from '../types';

interface CompareDataProps {
  workshops: Workshop[];
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const CompareData: React.FC<CompareDataProps> = ({ workshops }) => {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-900 font-serif">Comparative Multi-Matrix</h3>
            <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest">Cross-sectional analysis of workshop efficiency.</p>
          </div>
          <button className="px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
            Download Matrix
          </button>
        </div>
        
        <div className="overflow-x-auto -mx-10 px-10">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Workshop Identity</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Category</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Execution Date</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Reach</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Score</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Strategic Goal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {workshops.map(w => (
                <tr key={w.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="p-6">
                    <div className="font-black text-slate-900 leading-tight group-hover:text-indigo-700">{w.title}</div>
                    <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Lead: {w.lead}</div>
                  </td>
                  <td className="p-6">
                     <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                      {w.category}
                    </span>
                  </td>
                  <td className="p-6 text-sm font-bold text-slate-500 font-mono">{formatDate(w.date)}</td>
                  <td className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 font-black text-slate-700">
                      {w.metrics?.participantCount || 0}
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl font-black text-sm border ${
                      (w.feedback?.averageRating || 0) >= 4.5 ? 'bg-green-50 text-green-700 border-green-100' :
                      (w.feedback?.averageRating || 0) >= 4.0 ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      'bg-slate-50 text-slate-700 border-slate-100'
                    }`}>
                      {w.feedback?.averageRating || 0}
                    </div>
                  </td>
                  <td className="p-6 text-sm text-slate-500 italic leading-relaxed">
                    <p className="line-clamp-2">"{w.theme}"</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-indigo-900 p-10 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-xl"></div>
          <h4 className="text-2xl font-black mb-8 font-serif relative z-10">Consolidated Strategic Actions</h4>
          <div className="space-y-4 relative z-10">
            {workshops.flatMap(w => (w.actionPlan || []).slice(0, 1)).map((p, i) => (
              <div key={i} className="flex items-center space-x-4 p-5 bg-white/10 rounded-2xl border border-white/5 backdrop-blur-sm group hover:bg-white/20 transition-all">
                <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-lg">{i+1}</span>
                <p className="text-sm font-medium leading-relaxed">{p}</p>
              </div>
            ))}
            {workshops.length === 0 && <p className="text-indigo-200 text-sm italic">No data available for strategic analysis.</p>}
          </div>
        </div>
        
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-amber-50 rounded-full opacity-50 blur-3xl"></div>
          <div className="w-24 h-24 bg-amber-100 rounded-[2rem] flex items-center justify-center text-4xl mb-6 shadow-xl shadow-amber-100/50">🏆</div>
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Excellence Benchmark</h4>
          <p className="text-4xl font-black text-slate-900 font-serif mb-4">Spiritual Curriculum</p>
          <div className="px-6 py-2 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest">
            Highest Satisfaction Rating
          </div>
          <p className="text-xs text-slate-400 mt-6 font-medium">Metric derived from cumulative school feedback 2024-25</p>
        </div>
      </div>
    </div>
  );
};

export default CompareData;

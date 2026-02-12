
import React, { useState } from 'react';
import { Workshop, WorkshopCategory } from '../types';
import { Link } from 'react-router-dom';

interface WorkshopInventoryProps {
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

const WorkshopInventory: React.FC<WorkshopInventoryProps> = ({ workshops }) => {
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  const dataCategories = Array.from(new Set(workshops.map(w => w.category)));
  const categories = ['All', ...dataCategories];

  const filtered = workshops.filter(w => {
    const matchesCategory = filter === 'All' || w.category === filter;
    const matchesSearch = w.title.toLowerCase().includes(search.toLowerCase()) || 
                          w.venue.toLowerCase().includes(search.toLowerCase()) ||
                          w.lead.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex-1 max-w-md relative">
          <span className="absolute left-4 top-3.5 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search workshops, leads, or venues..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all uppercase tracking-widest ${
                filter === cat 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(w => (
          <Link
            key={w.id}
            to={`/workshop/${w.id}`}
            className="bg-white rounded-3xl border border-slate-200 p-8 hover:shadow-2xl transition-all flex flex-col group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-4xl">🏛️</span>
            </div>
            
            <div className="flex justify-between items-start mb-6">
              <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                w.category === WorkshopCategory.SpiritualCurriculum ? 'bg-amber-100 text-amber-700' :
                w.category === WorkshopCategory.AILiteracy ? 'bg-blue-100 text-blue-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {w.category}
              </span>
              <div className="flex items-center text-xs font-bold text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                {w.frequency}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-4 line-clamp-2 font-serif leading-tight">
              {w.title}
            </h3>
            
            <div className="space-y-4 flex-grow">
              <div className="flex items-center text-sm text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold mr-3 text-xs shrink-0">
                  {w.lead.charAt(0)}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Lead</p>
                  <p className="font-semibold text-slate-700 truncate">{w.lead}</p>
                </div>
              </div>
              
              <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed italic">
                "{w.theme}"
              </p>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Venue</p>
                <p className="text-xs font-semibold text-slate-700 truncate">{w.venue}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</p>
                <p className="text-xs font-semibold text-slate-700">{formatDate(w.date)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <div className="text-6xl mb-6">🏜️</div>
          <h3 className="text-xl font-bold text-slate-800">No matches found</h3>
          <p className="text-slate-400 max-w-xs mx-auto mt-2">Try adjusting your filters or search terms to find what you're looking for.</p>
        </div>
      )}
    </div>
  );
};

export default WorkshopInventory;


import React, { useState, useMemo } from 'react';
import { Workshop } from '../types';
import { Link } from 'react-router-dom';

interface DashboardProps {
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

const Dashboard: React.FC<DashboardProps> = ({ workshops }) => {
  const years = useMemo(() => {
    // Generate a list of years from 2020 to 2030
    const startYear = 2020;
    const endYear = 2030;
    const range: string[] = [];
    for (let y = endYear; y >= startYear; y--) {
      range.push(y.toString());
    }
    
    // Also add any years from existing workshops that might be outside this range
    const workshopYears = workshops.map(w => new Date(w.date).getFullYear().toString());
    const combinedYears = Array.from(new Set([...range, ...workshopYears]));
    
    return combinedYears.sort((a, b) => b.localeCompare(a));
  }, [workshops]);

  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const filteredWorkshops = useMemo(() => {
    return workshops.filter(w => new Date(w.date).getFullYear().toString() === selectedYear);
  }, [workshops, selectedYear]);

  const totalParticipants = filteredWorkshops.reduce((acc, w) => acc + w.metrics.participantCount, 0);
  const avgFeedback = filteredWorkshops.length > 0 
    ? (filteredWorkshops.reduce((acc, w) => acc + w.feedback.averageRating, 0) / filteredWorkshops.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Hero Stats Section */}
      <div className="bg-indigo-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-800 rounded-full -mr-20 -mt-20 opacity-50 blur-3xl"></div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold font-serif mb-2">Annual Impact Report</h2>
            <p className="text-indigo-200 text-sm max-w-md">Comprehensive analysis of educational excellence and teacher training across the Darshan Academy network for the year {selectedYear}.</p>
            <div className="mt-6">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-indigo-800/50 border border-indigo-700 text-white text-sm rounded-xl focus:ring-amber-500 focus:border-amber-500 block p-3 font-bold outline-none backdrop-blur-sm transition-all"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-2">Total Participants</p>
            <p className="text-4xl font-bold">{totalParticipants.toLocaleString()}</p>
            <p className="text-indigo-300 text-[10px] mt-2">+5% from previous cycle</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-2">Avg. Feedback</p>
            <p className="text-4xl font-bold">{avgFeedback}</p>
            <div className="flex mt-2">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-xs ${i < Math.round(Number(avgFeedback)) ? 'text-amber-400' : 'text-indigo-800'}`}>★</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Workshop List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Academic & Administrative Catalog</h3>
            <p className="text-sm text-slate-500 mt-1">Detailed breakdown of workshops conducted in {selectedYear}.</p>
          </div>
          <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold shadow-sm">
            {filteredWorkshops.length} Active Records
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Workshop & Date</th>
                <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Lead Organizer</th>
                <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Attendance</th>
                <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWorkshops.length > 0 ? (
                filteredWorkshops.map((w) => (
                  <tr key={w.id} className="hover:bg-indigo-50/30 transition-all group">
                    <td className="p-6">
                      <div className="font-bold text-slate-900 text-base group-hover:text-indigo-700 transition-colors">{w.title}</div>
                      <div className="text-xs font-semibold text-slate-400 mt-1 flex items-center">
                        <span className="mr-2">📅</span> {formatDate(w.date)}
                        <span className="mx-2 text-slate-200">|</span>
                        <span className="text-indigo-500">{w.category}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                          {w.lead.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="text-sm font-semibold text-slate-700">{w.lead}</div>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="inline-block px-3 py-1 bg-slate-100 rounded-lg font-bold text-slate-700 text-sm">
                        {w.metrics.participantCount}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <Link 
                        to={`/workshop/${w.id}`}
                        className="inline-flex items-center px-5 py-2.5 bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-indigo-100"
                      >
                        Detail View →
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-24 text-center">
                    <div className="flex flex-col items-center">
                      <div className="text-4xl mb-4 text-slate-200">📭</div>
                      <p className="text-slate-400 font-medium">No records found for the academic year {selectedYear}.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

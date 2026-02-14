import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Workshop } from '../types';

interface WorkshopDetailProps {
  workshops: Workshop[];
  onDeleteWorkshop: (id: string) => Promise<void>;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const WorkshopDetail: React.FC<WorkshopDetailProps> = ({ workshops, onDeleteWorkshop }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const workshop = workshops.find(w => w.id === id);

  const totalIncurred = useMemo(() => {
    return workshop?.budget?.expenses?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
  }, [workshop]);

  const budgetStatus = useMemo(() => {
    if (!workshop?.budget) return null;
    const allocated = workshop.budget.allocated || 0;
    if (allocated === 0) return 'neutral';
    if (totalIncurred > allocated) return 'over';
    return 'within';
  }, [workshop, totalIncurred]);

  const handleDeletion = async () => {
    if (!workshop) return;
    const confirmed = window.confirm(`Institutional Warning: Are you sure you want to permanently delete the records for "${workshop.title}"? This action cannot be undone.`);
    if (confirmed) {
      await onDeleteWorkshop(workshop.id);
      navigate('/inventory');
    }
  };

  if (!workshop) {
    return (
      <div className="text-center py-24">
        <div className="text-6xl mb-6">🔍</div>
        <h2 className="text-2xl font-bold text-slate-800">Workshop not found</h2>
        <Link to="/inventory" className="text-indigo-600 mt-6 inline-flex items-center font-bold hover:underline">
          <span className="mr-2">←</span> Back to Inventory
        </Link>
      </div>
    );
  }

  const agenda = workshop.agenda || [];
  const speakers = workshop.speakers || [];
  const activities = workshop.activities || [];
  const actionPlan = workshop.actionPlan || [];
  const feedbackComments = workshop.feedback?.qualitativeComments || [];

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      {/* Detail Header Card */}
      <div className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full -mr-48 -mt-48 opacity-40 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex-1 space-y-4">
            <div className="flex items-center space-x-3">
              <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                {workshop.category}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
                Cataloged
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 font-serif leading-tight">{workshop.title}</h1>
            <p className="text-xl text-slate-500 italic font-medium leading-relaxed max-w-2xl">"{workshop.theme}"</p>
          </div>
          <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
            <Link 
              to={`/edit/${workshop.id}`}
              className="w-full text-center px-8 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-3 uppercase tracking-widest"
            >
              <span>✏️</span> Edit Records
            </Link>
            <button 
              onClick={handleDeletion}
              className="w-full px-8 py-4 bg-white border border-red-100 text-red-500 rounded-2xl text-sm font-bold hover:bg-red-50 transition-all shadow-sm flex items-center justify-center gap-3 uppercase tracking-widest"
            >
              <span>🗑️</span> Delete Record
            </button>
            <button className="w-full px-8 py-3 bg-white border border-slate-200 text-slate-400 rounded-2xl text-[10px] font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-3 uppercase tracking-widest">
              <span>📄</span> Export PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mt-12 pt-10 border-t border-slate-100 relative z-10">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workshop Lead</p>
            <p className="text-base font-bold text-slate-800">{workshop.lead}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scheduled Date</p>
            <p className="text-base font-bold text-slate-800">{formatDate(workshop.date)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Venue</p>
            <p className="text-base font-bold text-slate-800">{workshop.venue}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cycle</p>
            <p className="text-base font-bold text-slate-800">{workshop.frequency}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Participants</p>
            <p className="text-base font-bold text-slate-800">{workshop.metrics?.participantCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Budget Analysis Module */}
      <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-10 border-b border-slate-100 bg-green-50/20 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-slate-900 flex items-center font-serif">
            <span className="mr-4 bg-white shadow-sm p-3 rounded-2xl text-xl">💰</span> Financial Audit
          </h3>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Allocated</p>
              <p className="text-lg font-black text-slate-900">₹ {(workshop.budget?.allocated || 0).toLocaleString()}</p>
            </div>
            <div className="h-10 w-px bg-slate-200"></div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incurred</p>
              <p className={`text-lg font-black ${budgetStatus === 'over' ? 'text-red-600' : 'text-green-600'}`}>
                ₹ {totalIncurred.toLocaleString()}
              </p>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
              budgetStatus === 'over' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {budgetStatus === 'over' ? 'Budget Overrun' : 'Within Budget'}
            </div>
          </div>
        </div>
        <div className="p-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {workshop.budget?.expenses?.map((expense, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm font-semibold text-slate-700">{expense.description}</td>
                  <td className="p-4 text-sm font-black text-slate-900 text-right">₹ {(expense.amount || 0).toLocaleString()}</td>
                </tr>
              ))}
              {(!workshop.budget?.expenses || workshop.budget.expenses.length === 0) && (
                <tr>
                  <td colSpan={2} className="p-8 text-center text-sm text-slate-400 italic">No incurred expenses documented for this cycle.</td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-50/50">
              <tr>
                <td className="p-4 text-sm font-black text-slate-900 uppercase">Total Utilization</td>
                <td className="p-4 text-sm font-black text-slate-900 text-right">₹ {totalIncurred.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="space-y-10">
        {/* Agenda Section */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-2xl font-bold text-slate-900 flex items-center font-serif">
              <span className="mr-4 bg-white shadow-sm p-3 rounded-2xl text-xl">📅</span> Workshop Agenda
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Time-Bound Sessions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/30 border-b border-slate-100">
                  <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest w-20">S.No</th>
                  <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest w-32">Timeline</th>
                  <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Description & Particulars</th>
                  <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Speaker/Resource</th>
                  <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Admin Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {agenda.map((item, i) => (
                  <tr key={i} className="hover:bg-indigo-50/20 transition-all">
                    <td className="p-6 text-sm font-black text-slate-300">{(i + 1).toString().padStart(2, '0')}</td>
                    <td className="p-6">
                      <div className="flex flex-col text-xs font-bold text-indigo-600 space-y-1">
                        <span className="bg-indigo-50 px-2 py-1 rounded-md text-center">{item.startTime}</span>
                        <span className="bg-slate-50 px-2 py-1 rounded-md text-center text-slate-400">TO</span>
                        <span className="bg-indigo-50 px-2 py-1 rounded-md text-center">{item.endTime}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-slate-800 leading-tight">{item.particulars}</span>
                        {item.isActivity && (
                          <span className="mt-2 inline-flex items-center px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-black uppercase rounded-full border border-amber-100">
                             ✨ Collaborative Activity
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-6 text-sm font-semibold text-slate-600">{item.speaker || '—'}</td>
                    <td className="p-6 text-xs text-slate-400 italic leading-relaxed">{item.remarks}</td>
                  </tr>
                ))}
                {agenda.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400 italic">No agenda segments defined.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Speakers Section */}
          <section className="bg-white p-10 rounded-[2rem] border border-slate-200 shadow-xl space-y-8">
            <h3 className="text-2xl font-bold text-slate-900 flex items-center font-serif">
              <span className="mr-4 bg-indigo-50 p-3 rounded-2xl text-xl">🎤</span> Resource Persons
            </h3>
            <div className="space-y-6">
              {speakers.map((s, i) => (
                <div key={i} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{s.name}</p>
                      <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-1">{s.designation || 'Special Guest'}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Core Contribution</p>
                    <p className="text-sm text-slate-600 leading-relaxed italic">
                      "{s.takeaways || 'No primary takeaway recorded.'}"
                    </p>
                  </div>
                </div>
              ))}
              {speakers.length === 0 && <p className="text-sm text-slate-400 italic text-center">No resource persons documented.</p>}
            </div>
          </section>

          {/* Activities Section */}
          <section className="bg-white p-10 rounded-[2rem] border border-slate-200 shadow-xl space-y-8">
            <h3 className="text-2xl font-bold text-slate-900 flex items-center font-serif">
              <span className="mr-4 bg-amber-50 p-3 rounded-2xl text-xl">🎨</span> Training Modules
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {activities.map((a, i) => (
                <div key={i} className="flex items-center space-x-4 p-5 bg-amber-50/30 rounded-2xl border border-amber-100/50 hover:bg-amber-50 transition-colors">
                  <span className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-amber-600 text-xs font-bold">
                    {i+1}
                  </span>
                  <span className="text-sm font-bold text-slate-700">{a}</span>
                </div>
              ))}
              {activities.length === 0 && <p className="text-sm text-slate-400 italic text-center">No training modules listed.</p>}
            </div>
          </section>
        </div>

        {/* Action Plan & Feedback Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <section className="bg-indigo-900 text-white p-10 rounded-[2rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mt-16 blur-xl"></div>
            <h3 className="text-2xl font-bold mb-8 flex items-center font-serif relative z-10">
              <span className="mr-4 bg-indigo-800 p-3 rounded-2xl text-xl">🚀</span> Action Points
            </h3>
            <div className="space-y-6 relative z-10">
              {actionPlan.map((p, i) => (
                <div key={i} className="flex items-start space-x-5 bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-sm group hover:bg-white/20 transition-all">
                  <span className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-xs font-black shrink-0 shadow-lg">
                    {i+1}
                  </span>
                  <p className="text-sm font-medium leading-relaxed text-indigo-50">{p}</p>
                </div>
              ))}
              {actionPlan.length === 0 && <p className="text-sm text-indigo-300 italic">No action points recorded for this cycle.</p>}
            </div>
          </section>

          <section className="bg-white p-10 rounded-[2rem] border border-slate-200 shadow-xl space-y-8">
            <h3 className="text-2xl font-bold text-slate-900 flex items-center font-serif">
              <span className="mr-4 bg-slate-50 p-3 rounded-2xl text-xl">💬</span> Feedback Analysis
            </h3>
            <div className="space-y-8">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Satisfaction Score</p>
                    <p className="text-4xl font-black text-indigo-600 mt-1">{workshop.feedback?.averageRating || 0} <span className="text-lg text-slate-300">/ 5.0</span></p>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-xl ${i < Math.round(workshop.feedback?.averageRating || 0) ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                    ))}
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 p-1 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(79,70,229,0.5)]" 
                    style={{ width: `${((workshop.feedback?.averageRating || 0) / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                  Qualitative Summary
                </p>
                <div className="space-y-3">
                  {feedbackComments.map((c, i) => (
                    <div key={i} className="text-sm italic text-slate-600 border-l-4 border-indigo-100 pl-4 py-1 leading-relaxed">
                      "{c}"
                    </div>
                  ))}
                  {feedbackComments.length === 0 && <p className="text-xs text-slate-400 italic">No qualitative comments documented.</p>}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default WorkshopDetail;
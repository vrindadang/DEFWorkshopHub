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

  const handleExportPDF = () => {
    window.print();
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
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          aside, header, .no-print, .fixed, nav, button, a.no-print {
            display: none !important;
          }
          body, #root {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            overflow: visible !important;
            width: 100% !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
          }
          .flex, .grid {
            display: flex !important;
          }
          .max-w-6xl {
            max-width: 100% !important;
            width: 100% !important;
            padding: 2rem !important;
          }
          .bg-white, .bg-slate-50, .bg-indigo-900, .bg-indigo-50, .bg-green-50, .bg-amber-50 {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .shadow-2xl, .shadow-xl, .shadow-sm {
            box-shadow: none !important;
            border: 1px solid #e2e8f0 !important;
          }
          .rounded-[2rem], .rounded-3xl, .rounded-[2.5rem], .rounded-2xl {
            border-radius: 12px !important;
          }
          table {
            page-break-inside: auto;
            width: 100% !important;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          section, .card {
            page-break-inside: avoid;
            margin-bottom: 2rem !important;
          }
          h1, h2, h3 {
            page-break-after: avoid;
          }
        }
      ` }} />

      {/* Detail Header Card */}
      <div className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-2xl relative overflow-hidden card">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full -mr-48 -mt-48 opacity-40 blur-3xl no-print"></div>
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
          <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto no-print">
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
            <button 
              onClick={handleExportPDF}
              className="w-full px-8 py-3 bg-white border border-slate-200 text-slate-400 rounded-2xl text-[10px] font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-3 uppercase tracking-widest"
            >
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
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reach</p>
            <p className="text-base font-bold text-slate-800">{workshop.metrics?.participantCount || 0} Participants</p>
          </div>
        </div>
      </div>

      {/* Operational Timeline & Resource Persons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Agenda Table */}
          <section className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden card">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30">
              <h3 className="text-xl font-black text-slate-800 font-serif flex items-center">
                <span className="mr-3 text-2xl">📅</span> Operational Timeline
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-24">Interval</th>
                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Session / Particulars</th>
                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Speaker</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {agenda.map((item, idx) => (
                    <tr key={idx} className={item.isActivity ? 'bg-amber-50/30' : ''}>
                      <td className="p-5 font-mono text-xs text-indigo-600 font-bold">
                        {item.startTime} - {item.endTime}
                      </td>
                      <td className="p-5">
                        <div className="font-bold text-slate-800 text-sm">
                          {item.isActivity && <span className="mr-2 text-amber-500">🎨</span>}
                          {item.particulars}
                        </div>
                        {item.remarks && <p className="text-[10px] text-slate-400 mt-1 italic font-medium">{item.remarks}</p>}
                      </td>
                      <td className="p-5 text-sm font-semibold text-slate-600">{item.speaker || '--'}</td>
                    </tr>
                  ))}
                  {agenda.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-10 text-center text-slate-400 italic">No agenda items cataloged.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Action Plan */}
          <section className="bg-indigo-900 rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden card">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500"></div>
            <h3 className="text-2xl font-black mb-8 font-serif">Institutional Action Plan</h3>
            <div className="space-y-4">
              {actionPlan.map((step, idx) => (
                <div key={idx} className="flex items-start gap-5 p-5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                  <span className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-[10px] font-black shrink-0 shadow-lg">
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  <p className="text-sm font-medium leading-relaxed text-indigo-50">{step}</p>
                </div>
              ))}
              {actionPlan.length === 0 && <p className="text-indigo-300 italic">No post-workshop actions specified.</p>}
            </div>
          </section>
        </div>

        <div className="space-y-10">
          {/* Resource Profiles */}
          <section className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden card">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30">
              <h3 className="text-xl font-black text-slate-800 font-serif">Resource Persons</h3>
            </div>
            <div className="p-8 space-y-8">
              {speakers.map((speaker, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-lg">
                      {speaker.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-base font-black text-slate-800">{speaker.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{speaker.designation}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl italic text-xs text-slate-500 leading-relaxed border-l-2 border-indigo-200">
                    "{speaker.takeaways}"
                  </div>
                </div>
              ))}
              {speakers.length === 0 && <p className="text-center text-slate-400 italic">No speakers listed.</p>}
            </div>
          </section>

          {/* Training Modules */}
          <section className="bg-amber-50 rounded-[2rem] p-8 border border-amber-100 shadow-sm card">
            <h3 className="text-lg font-black text-amber-900 font-serif mb-6 flex items-center">
              <span className="mr-3">🧩</span> Activity Matrix
            </h3>
            <div className="flex flex-wrap gap-2">
              {activities.map((act, idx) => (
                <span key={idx} className="px-4 py-2 bg-white text-amber-700 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border border-amber-200/50">
                  {act}
                </span>
              ))}
              {activities.length === 0 && <p className="text-amber-600/60 text-xs italic">No specific activities cataloged.</p>}
            </div>
          </section>

          {/* Financial Audit */}
          <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl card">
             <h3 className="text-lg font-black text-slate-800 font-serif mb-6">Financial Audit</h3>
             <div className="space-y-6">
                <div className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Budget</p>
                    <p className="text-xl font-black text-slate-900">₹ {(workshop.budget?.allocated || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Audit Status</p>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      budgetStatus === 'within' ? 'text-green-600' : 
                      budgetStatus === 'over' ? 'text-red-600' : 'text-slate-500'
                    }`}>
                      {budgetStatus === 'within' ? 'Optimal' : budgetStatus === 'over' ? 'Deficit' : 'N/A'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incurred Expenses</p>
                  <div className="space-y-2">
                    {workshop.budget?.expenses?.map((exp, idx) => (
                      <div key={idx} className="flex justify-between text-xs py-2 border-b border-slate-50">
                        <span className="font-medium text-slate-600">{exp.description}</span>
                        <span className="font-bold text-slate-800">₹ {exp.amount?.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-3 text-sm">
                      <span className="font-black text-slate-400 uppercase tracking-tighter">Cumulative</span>
                      <span className={`font-black ${budgetStatus === 'over' ? 'text-red-600' : 'text-indigo-600'}`}>
                        ₹ {totalIncurred.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
             </div>
          </section>
        </div>
      </div>

      {/* Feedback Section */}
      <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden card">
        <div className="grid grid-cols-1 md:grid-cols-4">
          <div className="p-10 bg-indigo-50 border-r border-slate-100 flex flex-col justify-center items-center text-center">
            <div className="text-5xl font-black text-indigo-600 mb-2">{workshop.feedback?.averageRating || 'N/A'}</div>
            <div className="flex mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-xl ${i < Math.round(workshop.feedback?.averageRating || 0) ? 'text-amber-400' : 'text-indigo-100'}`}>★</span>
              ))}
            </div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Composite Satisfaction Score</p>
          </div>
          <div className="col-span-3 p-10 space-y-6">
            <h3 className="text-xl font-black text-slate-800 font-serif">Qualitative Impact Feedback</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedbackComments.map((comment, idx) => (
                <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 italic text-sm text-slate-600 leading-relaxed relative">
                  <span className="absolute top-2 left-2 text-3xl text-slate-200 opacity-50 font-serif">“</span>
                  <p className="relative z-10">{comment}</p>
                </div>
              ))}
              {feedbackComments.length === 0 && <p className="text-slate-400 italic">No comments cataloged yet.</p>}
            </div>
          </div>
        </div>
      </section>

      {/* Footer Branding for Institutional use */}
      <div className="text-center pt-20 border-t border-slate-100 pb-10 print:pt-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Darshan Academy Educational Hub</p>
        <p className="text-[8px] text-slate-300 mt-2">© {new Date().getFullYear()} Darshan Education Foundation. Strictly for internal administrative purposes.</p>
      </div>
    </div>
  );
};

export default WorkshopDetail;
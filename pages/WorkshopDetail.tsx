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
          /* Global Print Resets */
          html, body {
            background: white !important;
            color: black !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Hide UI elements */
          aside, header, nav, .no-print, button, a {
            display: none !important;
          }

          /* Force Container Full Width */
          #root, main, .max-w-6xl {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }

          /* Ensure colors are printed */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Report Layout Improvements */
          .report-section {
            page-break-inside: avoid;
            margin-bottom: 2rem !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 0.75rem !important;
            padding: 2rem !important;
          }

          .print-title {
            font-size: 2.5rem !important;
            margin-bottom: 1rem !important;
            font-family: 'Playfair Display', serif !important;
          }

          .print-header-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1.5rem !important;
            border-bottom: 2px solid #312e81 !important;
            padding-bottom: 2rem !important;
            margin-bottom: 2rem !important;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-top: 1rem !important;
          }

          th {
            background-color: #f1f5f9 !important;
            color: #475569 !important;
            text-align: left !important;
            padding: 0.75rem !important;
            font-size: 0.75rem !important;
            text-transform: uppercase !important;
            border-bottom: 1px solid #e2e8f0 !important;
          }

          td {
            padding: 0.75rem !important;
            border-bottom: 1px solid #f1f5f9 !important;
            font-size: 0.875rem !important;
          }

          .page-break {
            page-break-before: always;
          }

          /* Logo/Institutional Header for PDF */
          .pdf-branding {
            display: block !important;
            text-align: center;
            margin-bottom: 3rem;
            border-bottom: 4px double #e2e8f0;
            padding-bottom: 1rem;
          }
        }

        .pdf-branding {
          display: none;
        }
      ` }} />

      {/* Hidden PDF Branding Header (Only visible on Print) */}
      <div className="pdf-branding">
        <h3 className="text-3xl font-black text-indigo-900 font-serif uppercase tracking-[0.2em]">Darshan Academy</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Workshop Completion & Impact Report</p>
      </div>

      {/* Detail Header Card */}
      <div className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-2xl relative overflow-hidden card report-section">
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
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 font-serif leading-tight print-title">{workshop.title}</h1>
            <p className="text-xl text-slate-500 italic font-medium leading-relaxed max-w-2xl">"{workshop.theme}"</p>
          </div>
          <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto no-print">
            <Link 
              to={`/edit/${workshop.id}`}
              className="w-full text-center px-8 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-3 uppercase tracking-widest"
            >
              <span>✏️</span> EDIT RECORDS
            </Link>
            <button 
              onClick={handleDeletion}
              className="w-full px-8 py-4 bg-white border border-red-100 text-red-500 rounded-2xl text-sm font-bold hover:bg-red-50 transition-all shadow-sm flex items-center justify-center gap-3 uppercase tracking-widest"
            >
              <span>🗑️</span> DELETE RECORD
            </button>
            <button 
              onClick={handleExportPDF}
              className="w-full px-8 py-3 bg-white border border-slate-200 text-slate-400 rounded-2xl text-[10px] font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-3 uppercase tracking-widest"
            >
              <span>📄</span> EXPORT PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mt-12 pt-10 border-t border-slate-100 relative z-10 print-header-grid">
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

      {/* Operational Timeline Table */}
      <section className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden card report-section">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30">
          <h3 className="text-xl font-black text-slate-800 font-serif flex items-center">
            <span className="mr-3 text-2xl no-print">📅</span> Operational Timeline
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
                      {item.isActivity && <span className="mr-2 text-amber-500 no-print">🎨</span>}
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

      {/* Resource Persons & Financial Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Resource Profiles Table for Print */}
          <section className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden card report-section">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30">
              <h3 className="text-xl font-black text-slate-800 font-serif">Resource Persons</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="p-5">Name & Designation</th>
                    <th className="p-5">Key Takeaways / Contribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {speakers.map((speaker, idx) => (
                    <tr key={idx}>
                      <td className="p-5">
                        <p className="text-sm font-black text-slate-800">{speaker.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{speaker.designation}</p>
                      </td>
                      <td className="p-5 text-xs text-slate-500 italic leading-relaxed">
                        "{speaker.takeaways}"
                      </td>
                    </tr>
                  ))}
                  {speakers.length === 0 && (
                    <tr>
                      <td colSpan={2} className="p-10 text-center text-slate-400 italic">No speakers listed.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Action Plan */}
          <section className="bg-indigo-900 rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden card report-section print:bg-white print:text-black print:border print:border-slate-200">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500 no-print"></div>
            <h3 className="text-2xl font-black mb-8 font-serif print:text-indigo-900">Institutional Action Plan</h3>
            <div className="space-y-4">
              {actionPlan.map((step, idx) => (
                <div key={idx} className="flex items-start gap-5 p-5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm print:bg-slate-50 print:border-slate-100">
                  <span className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-[10px] font-black shrink-0 shadow-lg text-white">
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  <p className="text-sm font-medium leading-relaxed text-indigo-50 print:text-slate-700">{step}</p>
                </div>
              ))}
              {actionPlan.length === 0 && <p className="text-indigo-300 italic print:text-slate-400">No post-workshop actions specified.</p>}
            </div>
          </section>
        </div>

        <div className="space-y-10">
          {/* Activity Matrix */}
          <section className="bg-amber-50 rounded-[2rem] p-8 border border-amber-100 shadow-sm card report-section">
            <h3 className="text-lg font-black text-amber-900 font-serif mb-6 flex items-center">
              <span className="mr-3 no-print">🧩</span> Activity Matrix
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

          {/* Financial Audit Table for Print */}
          <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl card report-section">
             <h3 className="text-lg font-black text-slate-800 font-serif mb-6">Financial Audit Summary</h3>
             <table className="w-full text-xs">
               <thead>
                 <tr>
                   <th className="p-2">Description</th>
                   <th className="p-2 text-right">Amount (₹)</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {workshop.budget?.expenses?.map((exp, idx) => (
                   <tr key={idx}>
                     <td className="p-2 text-slate-600">{exp.description}</td>
                     <td className="p-2 text-right font-bold text-slate-800">{exp.amount?.toLocaleString()}</td>
                   </tr>
                 ))}
                 <tr className="bg-slate-50">
                   <td className="p-2 font-black text-slate-800">CUMULATIVE INCURRED</td>
                   <td className="p-2 text-right font-black text-indigo-600">₹ {totalIncurred.toLocaleString()}</td>
                 </tr>
                 <tr>
                   <td className="p-2 font-black text-slate-400">ALLOCATED BUDGET</td>
                   <td className="p-2 text-right font-black text-slate-900">₹ {(workshop.budget?.allocated || 0).toLocaleString()}</td>
                 </tr>
               </tbody>
             </table>
             <div className="mt-4 text-center">
                <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full ${
                  budgetStatus === 'within' ? 'bg-green-100 text-green-700' : 
                  budgetStatus === 'over' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  Status: {budgetStatus === 'within' ? 'Optimal Execution' : budgetStatus === 'over' ? 'Budget Overrun' : 'N/A'}
                </span>
             </div>
          </section>
        </div>
      </div>

      {/* Feedback Section */}
      <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden card report-section">
        <div className="grid grid-cols-1 md:grid-cols-4 print:grid-cols-1">
          <div className="p-10 bg-indigo-50 border-r border-slate-100 flex flex-col justify-center items-center text-center print:border-none print:bg-white print:border-b">
            <div className="text-5xl font-black text-indigo-600 mb-2">{workshop.feedback?.averageRating || 'N/A'}</div>
            <div className="flex mb-4 no-print">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-xl ${i < Math.round(workshop.feedback?.averageRating || 0) ? 'text-amber-400' : 'text-indigo-100'}`}>★</span>
              ))}
            </div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Satisfaction Score</p>
          </div>
          <div className="col-span-3 p-10 space-y-6">
            <h3 className="text-xl font-black text-slate-800 font-serif">Impact Statements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-1">
              {feedbackComments.map((comment, idx) => (
                <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 italic text-sm text-slate-600 leading-relaxed relative print:bg-white print:border-none print:border-l-4 print:border-indigo-100">
                  <span className="absolute top-2 left-2 text-3xl text-slate-200 opacity-50 font-serif no-print">“</span>
                  <p className="relative z-10">"{comment}"</p>
                </div>
              ))}
              {feedbackComments.length === 0 && <p className="text-slate-400 italic">No feedback entries recorded.</p>}
            </div>
          </div>
        </div>
      </section>

      {/* Footer Branding for Institutional use */}
      <div className="text-center pt-20 border-t border-slate-100 pb-10 print:pt-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Darshan Academy Educational Hub</p>
        <p className="text-[8px] text-slate-300 mt-2">© {new Date().getFullYear()} Darshan Education Foundation. Institutional Record Generated on {new Date().toLocaleDateString()}.</p>
      </div>
    </div>
  );
};

export default WorkshopDetail;
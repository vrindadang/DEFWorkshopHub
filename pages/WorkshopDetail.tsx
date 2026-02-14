
import React, { useMemo, useRef, useState } from 'react';
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
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const workshop = workshops.find(w => w.id === id);

  const totalIncurred = useMemo(() => {
    return workshop?.budget?.expenses?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
  }, [workshop]);

  const handleDeletion = async () => {
    if (!workshop) return;
    const confirmed = window.confirm(`Institutional Warning: Are you sure you want to permanently delete the records for "${workshop.title}"? This action cannot be undone.`);
    if (confirmed) {
      await onDeleteWorkshop(workshop.id);
      navigate('/inventory');
    }
  };

  const handleExportPDF = async () => {
    if (!reportRef.current || !workshop) return;
    
    setIsExporting(true);
    const safeTitle = workshop.title.replace(/[/\\?%*:|"<>]/g, '-');
    
    // Temporarily bring the element into view for capture
    const element = reportRef.current;
    element.style.position = 'relative';
    element.style.left = '0';
    element.style.display = 'block';

    const opt = {
      margin: [10, 10, 15, 10],
      filename: `${safeTitle}_Report.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        letterRendering: true,
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    try {
      const html2pdf = (window as any).html2pdf;
      if (html2pdf) {
        await html2pdf().set(opt).from(element).save();
      } else {
        window.print();
      }
    } catch (error) {
      console.error("PDF Export failed:", error);
      alert("Institutional Notice: PDF generation failed. Falling back to system print.");
      window.print();
    } finally {
      // Re-hide the element from standard web view
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      setIsExporting(false);
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
    <div className="max-w-6xl mx-auto pb-20">
      <style dangerouslySetInnerHTML={{ __html: `
        /* PDF Specific Styles to match screenshots */
        .pdf-export-container {
          position: absolute;
          left: -9999px;
          top: 0;
          width: 210mm;
          padding: 20mm 15mm;
          background-color: white;
          color: #1e293b;
          font-family: 'Inter', sans-serif;
        }
        
        .pdf-branding-quote {
          font-size: 11px;
          color: #94a3b8;
          font-style: italic;
          margin-bottom: 12px;
          font-weight: 400;
        }

        .pdf-title {
          font-size: 34px;
          font-weight: 700;
          font-family: 'Playfair Display', serif;
          color: #312e81;
          margin-bottom: 6px;
        }

        .pdf-subtitle {
          font-size: 13px;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 24px;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 12px;
        }

        .pdf-section-header {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 16px;
          margin-top: 32px;
          color: #0f172a;
          letter-spacing: -0.01em;
        }

        .pdf-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }

        .pdf-table th {
          padding: 14px 18px;
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          color: white;
          font-weight: 800;
          letter-spacing: 0.08em;
          border: none;
        }

        .pdf-table td {
          padding: 12px 18px;
          border: 1px solid #e2e8f0;
          font-size: 13px;
          color: #334155;
          line-height: 1.6;
        }

        .theme-navy th { background-color: #1e3a8a; }
        .theme-purple th { background-color: #6366f1; }
        .theme-emerald th { background-color: #059669; }

        .pdf-feedback-container {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          margin-top: 20px;
          background-color: #ffffff;
          min-height: 60px;
        }

        .pdf-feedback-label {
          font-size: 11px;
          font-weight: 800;
          color: #cbd5e1;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin-bottom: 14px;
        }

        .pdf-feedback-item {
          border-left: 3px solid #6366f1;
          padding-left: 18px;
          margin-bottom: 12px;
          font-size: 13px;
          font-style: italic;
          color: #475569;
        }

        .pdf-footer {
          margin-top: 60px;
          text-align: center;
          padding-top: 40px;
          border-top: 1px solid #f1f5f9;
        }

        .pdf-footer-hub {
          font-size: 12px;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5em;
          margin-bottom: 10px;
        }

        .pdf-footer-credits {
          font-size: 9px;
          color: #cbd5e1;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        .page-break { page-break-before: always; }
        
        .exporting-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
      ` }} />

      {/* PDF TEMPLATE (RENDERED OFF-SCREEN TO PREVENT BLANK OUTPUT) */}
      <div ref={reportRef} className="pdf-export-container">
        <div className="pdf-branding-quote">
          With the blessings of H.H. Sant Rajinder Singh Ji Maharaj, Darshan Academy presents the academic workshop report.
        </div>
        <h1 className="pdf-title">{workshop.title}</h1>
        <div className="pdf-subtitle">WORKSHOP COMPLETION SUMMARY • {formatDate(workshop.date)}</div>

        {/* 1. Workshop Overview */}
        <div className="pdf-section-header">1. Workshop Overview</div>
        <table className="pdf-table theme-navy">
          <thead>
            <tr>
              <th style={{ width: '35%' }}>Metric</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="font-bold">Institutional Category</td><td>{workshop.category}</td></tr>
            <tr><td className="font-bold">Workshop Lead</td><td>{workshop.lead}</td></tr>
            <tr><td className="font-bold">Target Theme</td><td>{workshop.theme}</td></tr>
            <tr><td className="font-bold">Scheduled Venue</td><td>{workshop.venue}</td></tr>
            <tr><td className="font-bold">Execution Cycle</td><td>{workshop.frequency}</td></tr>
            <tr><td className="font-bold">Total Reach</td><td>{workshop.metrics?.participantCount || 0} Participants</td></tr>
          </tbody>
        </table>

        {/* 2. Operational Timeline */}
        <div className="pdf-section-header">2. Operational Timeline</div>
        <table className="pdf-table theme-purple">
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Time Slot</th>
              <th>Session Description</th>
              <th style={{ width: '30%' }}>Resource Person</th>
            </tr>
          </thead>
          <tbody>
            {agenda.length > 0 ? agenda.map((item, idx) => (
              <tr key={idx}>
                <td className="font-mono text-[11px] font-bold">{item.startTime} - {item.endTime}</td>
                <td>
                  <div className="font-bold">{item.particulars}</div>
                  {item.remarks && <div className="text-[10px] text-slate-400 mt-1">{item.remarks}</div>}
                </td>
                <td className="font-semibold text-slate-600">{item.speaker || '--'}</td>
              </tr>
            )) : (
              <tr><td colSpan={3} className="text-center italic text-slate-400">No agenda details cataloged.</td></tr>
            )}
          </tbody>
        </table>

        {/* 3. Deployment of Resources */}
        <div className="pdf-section-header">3. Deployment of Resources & Activities</div>
        <table className="pdf-table theme-emerald">
          <thead>
            <tr>
              <th style={{ width: '35%' }}>Resource Category</th>
              <th>Key Particulars / Modules</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-bold">Faculty Experts</td>
              <td>
                <div className="font-bold">{speakers.length > 0 ? speakers.map(s => s.name).join(', ') : 'N/A'}</div>
                <div className="text-[10px] text-slate-400">{speakers.length > 0 ? speakers.map(s => s.designation).join(', ') : ''}</div>
              </td>
            </tr>
            <tr>
              <td className="font-bold">Training Modules</td>
              <td>{activities.length > 0 ? activities.join(', ') : 'None cataloged'}</td>
            </tr>
            <tr>
              <td className="font-bold">Strategic Actions</td>
              <td>
                <div className="space-y-1">
                  {actionPlan.length > 0 ? actionPlan.map((plan, i) => (
                    <div key={i} className="flex gap-2">
                       <span className="text-slate-400">•</span>
                       <span>{plan}</span>
                    </div>
                  )) : <div>No strategic actions defined.</div>}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="page-break"></div>

        {/* 4. Financial & Qualitative Impact */}
        <div className="pdf-section-header">4. Financial & Qualitative Impact Log</div>
        <table className="pdf-table theme-navy">
          <thead>
            <tr>
              <th style={{ width: '60%' }}>Metric Descriptor</th>
              <th style={{ textAlign: 'right' }}>Evaluation / Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="font-bold">Allocated Budget</td><td style={{ textAlign: 'right' }} className="font-bold">₹ {(workshop.budget?.allocated || 0).toLocaleString()}</td></tr>
            {workshop.budget?.expenses?.map((exp, i) => (
              <tr key={i} className="text-slate-500 italic"><td style={{ paddingLeft: '24px' }}>- {exp.description}</td><td style={{ textAlign: 'right' }}>₹ {exp.amount?.toLocaleString()}</td></tr>
            ))}
            <tr style={{ backgroundColor: '#f8fafc' }} className="font-black"><td>Cumulative Incurred Expense</td><td style={{ textAlign: 'right' }}>₹ {totalIncurred.toLocaleString()}</td></tr>
            <tr><td className="font-bold">Satisfaction Score (Avg)</td><td style={{ textAlign: 'right' }} className="font-black text-indigo-700"><span className="text-blue-600 text-lg">{(workshop.feedback?.averageRating || 0).toFixed(0)}</span> / 5.0</td></tr>
          </tbody>
        </table>

        <div className="pdf-feedback-container">
          <div className="pdf-feedback-label">Qualitative Feedback Log</div>
          {feedbackComments.length > 0 ? (
            feedbackComments.map((comment, i) => (
              <div key={i} className="pdf-feedback-item">"{comment}"</div>
            ))
          ) : (
            <div className="text-[13px] text-slate-400 italic">" "</div>
          )}
        </div>

        <div className="pdf-footer">
          <div className="pdf-footer-hub">Darshan Academy Educational Hub</div>
          <div className="pdf-footer-credits">
            © {new Date().getFullYear()} DARSHAN EDUCATION FOUNDATION • INSTITUTIONAL ARCHIVE RECORD #{workshop.id.slice(-8)}
          </div>
        </div>
      </div>

      {/* WEB VIEW UI */}
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
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
                className="w-full text-center px-8 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-3 uppercase tracking-widest"
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
                disabled={isExporting}
                className={`w-full px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-3 uppercase tracking-widest ${isExporting ? 'exporting-pulse' : ''}`}
              >
                <span>📄</span> {isExporting ? 'GENERATING...' : 'EXPORT PDF'}
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
              <p className="text-base font-bold text-slate-800 leading-tight">{workshop.venue}</p>
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

        {/* Action Plan & Activities in Web View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl">
              <h3 className="text-xl font-bold font-serif text-slate-800 mb-6 flex items-center">
                 <span className="mr-3 text-2xl">📋</span> Strategic Action Plan
              </h3>
              <ul className="space-y-4">
                {actionPlan.map((plan, i) => (
                  <li key={i} className="flex gap-4 items-start text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                     <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">{i+1}</span>
                     {plan}
                  </li>
                ))}
              </ul>
           </div>
           <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl">
              <h3 className="text-xl font-bold font-serif text-slate-800 mb-6 flex items-center">
                 <span className="mr-3 text-2xl">🎯</span> Training Modules
              </h3>
              <div className="flex flex-wrap gap-3">
                {activities.map((act, i) => (
                  <span key={i} className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold border border-amber-100">
                    {act}
                  </span>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopDetail;

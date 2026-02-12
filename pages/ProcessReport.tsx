
import React, { useState } from 'react';
import { processWorkshopReport } from '../services/geminiService';
import { Workshop } from '../types';
import { useNavigate } from 'react-router-dom';

interface ProcessReportProps {
  onAddWorkshop: (w: Workshop) => void;
}

const ProcessReport: React.FC<ProcessReportProps> = ({ onAddWorkshop }) => {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleProcess = async () => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setError(null);

    try {
      const extractedData = await processWorkshopReport(text);
      const newWorkshop: Workshop = {
        id: Date.now().toString(),
        title: extractedData.title || 'Untitled Workshop',
        theme: extractedData.theme || 'No theme provided',
        category: extractedData.category as any || 'Teacher Training',
        lead: extractedData.lead || 'Unknown Organizer',
        date: extractedData.date || new Date().toISOString().split('T')[0],
        venue: extractedData.venue || 'Virtual',
        frequency: (extractedData.frequency as any) || 'One-time',
        agenda: extractedData.agenda || [],
        speakers: extractedData.speakers || [],
        activities: extractedData.activities || [],
        metrics: extractedData.metrics || { participantCount: 0, demographic: 'N/A' },
        feedback: extractedData.feedback || { averageRating: 0, qualitativeComments: [] },
        budget: extractedData.budget || { allocated: 0, expenses: [] },
        actionPlan: extractedData.actionPlan || []
      };

      onAddWorkshop(newWorkshop);
      navigate(`/workshop/${newWorkshop.id}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred during processing.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 font-serif mb-2">Automated Workshop Extraction</h2>
        <p className="text-slate-500 mb-6">
          Paste the raw text from your workshop report, meeting notes, or agenda. 
          The Hub Architect (Gemini) will automatically structure it into our institutional database.
        </p>

        <div className="space-y-4">
          <textarea
            className="w-full h-64 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-sm leading-relaxed"
            placeholder="Paste report text here... (e.g., 'The workshop on Security Excellence was held on March 22nd at Darshan Academy Amritpuri. Over 50 security guards attended...')"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="flex justify-end items-center gap-4">
            {isProcessing && (
              <div className="flex items-center text-indigo-600 text-sm font-medium">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Architect is analyzing report...
              </div>
            )}
            <button
              onClick={handleProcess}
              disabled={isProcessing || !text.trim()}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-indigo-200"
            >
              Structure Data
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="text-2xl mb-2">📂</div>
          <h4 className="font-bold text-slate-900 mb-1">Upload Notes</h4>
          <p className="text-xs text-slate-500 leading-relaxed">Turn loose meeting notes into formal institutional records in seconds.</p>
        </div>
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="text-2xl mb-2">📊</div>
          <h4 className="font-bold text-slate-900 mb-1">Extract Metrics</h4>
          <p className="text-xs text-slate-500 leading-relaxed">Identify participant counts and feedback scores from prose.</p>
        </div>
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="text-2xl mb-2">🚀</div>
          <h4 className="font-bold text-slate-900 mb-1">Auto-Action Plan</h4>
          <p className="text-xs text-slate-500 leading-relaxed">Let Gemini summarize "Moving Forward" strategies into tasks.</p>
        </div>
      </div>
    </div>
  );
};

export default ProcessReport;

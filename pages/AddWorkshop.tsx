
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Workshop, WorkshopCategory, Speaker, AgendaItem, BudgetItem } from '../types';
import { supabase } from '../services/supabaseClient';

interface AddWorkshopProps {
  onAddWorkshop: (w: Workshop) => void;
  onUpdateWorkshop?: (w: Workshop) => void;
  workshops: Workshop[];
}

const AddWorkshop: React.FC<AddWorkshopProps> = ({ onAddWorkshop, onUpdateWorkshop, workshops }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showConfigError, setShowConfigError] = useState(false);
  const [errorType, setErrorType] = useState<'bucket' | 'rls' | null>(null);
  
  const initialFormData: Omit<Workshop, 'id'> = {
    title: '',
    theme: '',
    category: WorkshopCategory.TeacherTraining,
    lead: '',
    date: new Date().toISOString().split('T')[0],
    venue: '',
    frequency: 'Annual',
    agenda: [{ particulars: '', startTime: '', endTime: '', speaker: '', remarks: '', isActivity: false }],
    speakers: [],
    activities: [],
    metrics: { participantCount: 0, demographic: '' },
    feedback: { averageRating: 5, qualitativeComments: [''] },
    budget: { allocated: 0, expenses: [{ description: '', amount: 0 }] },
    actionPlan: [''],
    attachmentUrl: undefined,
    attachmentName: undefined,
  };

  const [formData, setFormData] = useState<Omit<Workshop, 'id'>>(initialFormData);

  useEffect(() => {
    if (isEditMode && id) {
      const existing = workshops.find(w => w.id === id);
      if (existing) {
        const { id: _, ...rest } = existing;
        setFormData({
          ...rest,
          budget: rest.budget || { allocated: 0, expenses: [] }
        });
        if (!Object.values(WorkshopCategory).includes(existing.category as WorkshopCategory)) {
          setIsCustomCategory(true);
          setCustomCategory(existing.category);
        }
      }
    } else {
      setFormData(initialFormData);
    }
  }, [id, isEditMode, workshops]);

  useEffect(() => {
    const agendaSpeakers = formData.agenda
      .map(item => item.speaker.trim())
      .filter(name => name !== '' && name.toLowerCase() !== 'panel' && name.toLowerCase() !== 'none');
    
    const uniqueAgendaSpeakers = Array.from(new Set(agendaSpeakers));
    
    setFormData(prev => {
      const currentSpeakerMap = new Map(prev.speakers.map(s => [s.name, s]));
      const updatedSpeakers = uniqueAgendaSpeakers.map(name => {
        if (currentSpeakerMap.has(name)) return currentSpeakerMap.get(name)!;
        return { name, designation: '', takeaways: '' };
      });
      const manuallyAdded = prev.speakers.filter(s => !uniqueAgendaSpeakers.includes(s.name) && (s.designation || s.takeaways));
      const finalSpeakers = [...updatedSpeakers, ...manuallyAdded];
      if (JSON.stringify(prev.speakers) === JSON.stringify(finalSpeakers)) return prev;
      return { ...prev, speakers: finalSpeakers };
    });

    const agendaActivities = formData.agenda
      .filter(item => item.isActivity && item.particulars.trim() !== '')
      .map(item => item.particulars.trim());
    
    setFormData(prev => {
      const uniqueActivities = Array.from(new Set(agendaActivities));
      const manuallyAdded = prev.activities.filter(a => !uniqueActivities.includes(a));
      const finalActivities = [...uniqueActivities, ...manuallyAdded];
      if (JSON.stringify(prev.activities) === JSON.stringify(finalActivities)) return prev;
      return { ...prev, activities: finalActivities };
    });
  }, [formData.agenda]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'category') {
      if (value === 'CREATE_NEW') {
        setIsCustomCategory(true);
        setFormData((prev) => ({ ...prev, category: '' }));
      } else {
        setIsCustomCategory(false);
        setFormData((prev) => ({ ...prev, category: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCustomCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomCategory(val);
    setFormData((prev) => ({ ...prev, category: val }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setShowConfigError(false);
    setErrorType(null);
    
    try {
      const bucketName = 'workshop-attachments';
      // Use a folder-based timestamp to ensure path uniqueness while preserving original filename
      const filePath = `attachments/${Date.now()}/${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) {
        if (uploadError.message === 'Bucket not found') {
          setErrorType('bucket');
          setShowConfigError(true);
          throw new Error('Infrastructure Error: Missing workshop-attachments bucket.');
        }
        if (uploadError.message.includes('row-level security') || (uploadError as any).status === 403) {
          setErrorType('rls');
          setShowConfigError(true);
          throw new Error('Security Error: RLS Policy prevents public uploads.');
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        attachmentUrl: publicUrl,
        attachmentName: file.name
      }));
    } catch (error: any) {
      console.error('Archive Hub Upload Error:', error.message);
      if (!showConfigError) {
        alert(error.message || 'Failed to sync attachment to cloud storage.');
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...((prev as any)[parent]), [field]: value },
    }));
  };

  const handleArrayChange = (field: keyof Omit<Workshop, 'id'>, index: number, value: string) => {
    const newArr = [...(formData[field] as string[])];
    newArr[index] = value;
    setFormData((prev) => ({ ...prev, [field]: newArr }));
  };

  const handleAgendaChange = (index: number, field: keyof AgendaItem, value: any) => {
    const newAgenda = [...formData.agenda];
    newAgenda[index] = { ...newAgenda[index], [field]: value };
    setFormData((prev) => ({ ...prev, agenda: newAgenda }));
  };

  const moveAgendaItem = (index: number, direction: 'up' | 'down') => {
    const newAgenda = [...formData.agenda];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newAgenda.length) return;
    
    const temp = newAgenda[index];
    newAgenda[index] = newAgenda[targetIndex];
    newAgenda[targetIndex] = temp;
    
    setFormData(prev => ({ ...prev, agenda: newAgenda }));
  };

  const handleSpeakerChange = (index: number, field: keyof Speaker, value: string) => {
    const newSpeakers = [...formData.speakers];
    newSpeakers[index] = { ...newSpeakers[index], [field]: value };
    setFormData((prev) => ({ ...prev, speakers: newSpeakers }));
  };

  const handleBudgetExpenseChange = (index: number, field: keyof BudgetItem, value: any) => {
    const newExpenses = [...formData.budget.expenses];
    newExpenses[index] = { ...newExpenses[index], [field]: value };
    setFormData((prev) => ({
      ...prev,
      budget: { ...prev.budget, expenses: newExpenses }
    }));
  };

  const addItem = (field: keyof Omit<Workshop, 'id'>, emptyValue: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] as any[]), emptyValue],
    }));
  };

  const removeItem = (field: keyof Omit<Workshop, 'id'>, index: number) => {
    const arr = [...(formData[field] as any[])];
    if (arr.length > 0) {
      arr.splice(index, 1);
      setFormData((prev) => ({ ...prev, [field]: arr }));
    }
  };

  const addBudgetExpense = () => {
    setFormData(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        expenses: [...prev.budget.expenses, { description: '', amount: 0 }]
      }
    }));
  };

  const removeBudgetExpense = (index: number) => {
    const newExpenses = [...formData.budget.expenses];
    newExpenses.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      budget: { ...prev.budget, expenses: newExpenses }
    }));
  };

  const totalIncurred = useMemo(() => {
    return formData.budget.expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [formData.budget.expenses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = isCustomCategory ? customCategory.trim() : formData.category;
    const workshopData: Workshop = {
      ...formData,
      category: finalCategory || 'Uncategorized',
      id: isEditMode && id ? id : Date.now().toString(),
    };
    if (isEditMode && onUpdateWorkshop) onUpdateWorkshop(workshopData);
    else onAddWorkshop(workshopData);
    navigate(`/workshop/${workshopData.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto pb-32 animate-in fade-in duration-500">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 font-serif tracking-tight">
            {isEditMode ? 'Modify Catalog Record' : 'Create New Workshop Entry'}
          </h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">
            {isEditMode 
              ? `Updating archives for: ${formData.title || 'Draft'}` 
              : 'Populate the institutional database with high-fidelity workshop metrics.'}
          </p>
        </div>
        {isEditMode && (
          <button 
            type="button" 
            onClick={() => navigate(`/workshop/${id}`)}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            ← Back to Archives
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Core Administrative Profile */}
        <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 opacity-40 blur-3xl"></div>
          <h2 className="text-2xl font-black text-slate-800 border-b border-slate-100 pb-6 mb-8 flex items-center relative z-10">
            <span className="mr-4 bg-indigo-50 p-3 rounded-2xl text-xl">🏛️</span> Administrative Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            <div className="col-span-full">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Workshop Title</label>
              <input
                required
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800 text-lg"
                placeholder="e.g., National Security Excellence Conclave"
              />
            </div>
            <div className="col-span-full">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Institutional Theme & Objective</label>
              <textarea
                required
                name="theme"
                value={formData.theme}
                onChange={handleInputChange}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none h-32 transition-all font-medium text-slate-700 leading-relaxed"
                placeholder="Detail the core strategic goal of this training..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Classification</label>
              {!isCustomCategory ? (
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
                >
                  {Object.values(WorkshopCategory).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="CREATE_NEW" className="text-indigo-600 font-black">+ Create Custom Category</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    required
                    autoFocus
                    type="text"
                    value={customCategory}
                    onChange={handleCustomCategoryChange}
                    className="flex-1 px-6 py-4 bg-indigo-50/30 border-2 border-indigo-500/20 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-indigo-700"
                    placeholder="New category name..."
                  />
                  <button type="button" onClick={() => setIsCustomCategory(false)} className="px-4 text-slate-400">✕</button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Workshop Lead</label>
              <input
                required
                name="lead"
                value={formData.lead}
                onChange={handleInputChange}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
                placeholder="Name of Lead Organizer"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Event Date</label>
              <input
                required
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Cycle Frequency</label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleInputChange}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
              >
                <option value="Annual">Annual</option>
                <option value="Bi-Annual">Bi-Annual</option>
                <option value="One-time">One-time</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Total Participants (Reach)</label>
              <input
                type="number"
                value={formData.metrics.participantCount || ''}
                onChange={(e) => handleNestedChange('metrics', 'participantCount', Number(e.target.value))}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
                placeholder="0"
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Venue / Location</label>
              <input
                required
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
                placeholder="e.g., Auditorium, Darshan Academy Delhi"
              />
            </div>
          </div>
        </section>

        {/* Operational Timeline (Agenda) */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
          <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-2xl font-black text-slate-800 flex items-center font-serif">
              <span className="mr-4 bg-white shadow-sm p-3 rounded-2xl text-xl">📅</span> Operational Timeline
            </h2>
            <div className="text-right hidden md:block">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Architect Sync Engine</p>
               <p className="text-[9px] text-indigo-500 font-bold">Auto-populating Speakers & Activity modules</p>
            </div>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest w-16 text-center">#</th>
                  <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Start</th>
                  <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">End</th>
                  <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Particulars</th>
                  <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest w-48">Speaker</th>
                  <th className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-24">Activity?</th>
                  <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Remarks</th>
                  <th className="p-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {formData.agenda.map((item, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-xs font-black text-slate-300 text-center relative">
                      <div className="flex flex-col items-center gap-1 group-hover:text-indigo-400 transition-colors">
                        <button 
                          type="button" 
                          onClick={() => moveAgendaItem(idx, 'up')}
                          disabled={idx === 0}
                          title="Move Up"
                          className={`text-[8px] hover:text-indigo-600 focus:outline-none ${idx === 0 ? 'opacity-0 cursor-default' : 'opacity-100'}`}
                        >
                          ▲
                        </button>
                        <span>{(idx + 1).toString().padStart(2, '0')}</span>
                        <button 
                          type="button" 
                          onClick={() => moveAgendaItem(idx, 'down')}
                          disabled={idx === formData.agenda.length - 1}
                          title="Move Down"
                          className={`text-[8px] hover:text-indigo-600 focus:outline-none ${idx === formData.agenda.length - 1 ? 'opacity-0 cursor-default' : 'opacity-100'}`}
                        >
                          ▼
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <input
                        type="time"
                        value={item.startTime}
                        onChange={(e) => handleAgendaChange(idx, 'startTime', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="time"
                        value={item.endTime}
                        onChange={(e) => handleAgendaChange(idx, 'endTime', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </td>
                    <td className="p-4">
                      <input
                        value={item.particulars}
                        onChange={(e) => handleAgendaChange(idx, 'particulars', e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Session Name"
                      />
                    </td>
                    <td className="p-4">
                      <input
                        value={item.speaker}
                        onChange={(e) => handleAgendaChange(idx, 'speaker', e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Full Name"
                      />
                    </td>
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={item.isActivity}
                        onChange={(e) => handleAgendaChange(idx, 'isActivity', e.target.checked)}
                        className="w-5 h-5 text-indigo-600 border-slate-300 rounded-lg focus:ring-indigo-500 transition-all cursor-pointer"
                      />
                    </td>
                    <td className="p-4">
                      <input
                        value={item.remarks}
                        onChange={(e) => handleAgendaChange(idx, 'remarks', e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="..."
                      />
                    </td>
                    <td className="p-4 text-center">
                      <button type="button" onClick={() => removeItem('agenda', idx)} className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-10 pt-4">
            <button type="button" onClick={() => addItem('agenda', { particulars: '', startTime: '', endTime: '', speaker: '', remarks: '', isActivity: false })} className="w-full py-4 border-2 border-dashed border-indigo-200 rounded-2xl text-indigo-600 text-sm font-black uppercase tracking-widest hover:bg-indigo-50 hover:border-indigo-400 transition-all">
              + Append New Agenda Segment
            </button>
          </div>
        </section>

        {/* Budget Planning Module */}
        <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full -mr-32 -mt-32 opacity-40 blur-3xl"></div>
          <div className="flex justify-between items-center border-b border-slate-100 pb-6 mb-8 relative z-10">
            <h2 className="text-2xl font-black text-slate-800 flex items-center font-serif">
              <span className="mr-4 bg-green-50 p-3 rounded-2xl text-xl">💰</span> Financial Budgeting
            </h2>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cumulative Incurred</p>
              <p className={`text-xl font-black ${totalIncurred > formData.budget.allocated ? 'text-red-600' : 'text-green-600'}`}>
                ₹ {totalIncurred.toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Total Allocated Budget (₹)</label>
              <input
                type="number"
                value={formData.budget.allocated === 0 ? '' : formData.budget.allocated}
                onChange={(e) => handleNestedChange('budget', 'allocated', Number(e.target.value))}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-black text-slate-800 text-lg"
                placeholder="0"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Break-up of Budget Incurred</label>
              <div className="space-y-4">
                {formData.budget.expenses.map((expense, idx) => (
                  <div key={idx} className="flex gap-4 group items-center">
                    <input
                      value={expense.description}
                      onChange={(e) => handleBudgetExpenseChange(idx, 'description', e.target.value)}
                      className="flex-grow px-5 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm font-semibold text-slate-700"
                      placeholder="Expense Description (e.g. Travel, Kits)"
                    />
                    <div className="relative w-40">
                      <span className="absolute left-4 top-3 text-slate-400 font-bold text-sm">₹</span>
                      <input
                        type="number"
                        value={expense.amount === 0 ? '' : expense.amount}
                        onChange={(e) => handleBudgetExpenseChange(idx, 'amount', Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm font-black text-slate-800 text-right"
                        placeholder="0"
                      />
                    </div>
                    <button type="button" onClick={() => removeBudgetExpense(idx)} className="text-red-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">✕</button>
                  </div>
                ))}
                <button type="button" onClick={addBudgetExpense} className="w-full py-3 border-2 border-dashed border-green-200 rounded-xl text-green-600 text-xs font-black uppercase tracking-widest hover:bg-green-50 transition-all">
                  + Add Line Item
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.2fr] gap-12 items-start">
          {/* Resource Profiles */}
          <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-8">
            <h2 className="text-2xl font-black text-slate-800 border-b border-slate-100 pb-6 flex items-center font-serif">
              <span className="mr-4 bg-indigo-50 p-3 rounded-2xl text-xl">🎤</span> Resource Person Details
            </h2>
            <div className="space-y-8">
              {formData.speakers.map((speaker, idx) => (
                <div key={idx} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200 relative group transition-all hover:bg-white hover:shadow-xl">
                  <button type="button" onClick={() => removeItem('speakers', idx)} className="absolute top-6 right-6 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">✕</button>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Speaker Identity</label>
                      <input
                        value={speaker.name}
                        onChange={(e) => handleSpeakerChange(idx, 'name', e.target.value)}
                        className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-base font-black text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Designation / Role</label>
                      <input
                        value={speaker.designation}
                        onChange={(e) => handleSpeakerChange(idx, 'designation', e.target.value)}
                        className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-bold text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Principal Contribution</label>
                      <textarea
                        value={speaker.takeaways}
                        onChange={(e) => handleSpeakerChange(idx, 'takeaways', e.target.value)}
                        className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm h-24 font-medium italic"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => addItem('speakers', { name: '', designation: '', takeaways: '' })} className="w-full py-4 bg-indigo-50 text-indigo-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all">
                + Manually Catalog Speaker
              </button>
            </div>
          </section>

          {/* Right Column Stack: Training Modules & Attachments */}
          <div className="space-y-12">
            {/* Training Modules (Activities) */}
            <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-8">
              <h2 className="text-2xl font-black text-slate-800 border-b border-slate-100 pb-6 flex items-center font-serif">
                <span className="mr-4 bg-amber-50 p-3 rounded-2xl text-xl">🎨</span> Active Training Modules
              </h2>
              <div className="space-y-4">
                {formData.activities.map((item, idx) => (
                  <div key={idx} className="flex gap-3 group items-center bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:bg-white transition-all hover:shadow-lg">
                    <span className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white text-[10px] font-black shrink-0">{idx+1}</span>
                    <input
                      value={item}
                      onChange={(e) => handleArrayChange('activities', idx, e.target.value)}
                      className="flex-1 px-4 py-2 bg-transparent border-none focus:ring-0 outline-none font-bold text-slate-700 text-sm"
                    />
                    <button type="button" onClick={() => removeItem('activities', idx)} className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">✕</button>
                  </div>
                ))}
                <button type="button" onClick={() => addItem('activities', '')} className="w-full py-4 bg-amber-50 text-amber-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-amber-100 transition-all">
                  + New Training Module
                </button>
              </div>
            </section>

            {/* Supplemental Archives (Attachments) */}
            <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-8">
               <h2 className="text-2xl font-black text-slate-800 border-b border-slate-100 pb-6 flex items-center font-serif">
                  <span className="mr-4 bg-indigo-50 p-3 rounded-2xl text-xl">📂</span> Attachments
               </h2>
               <div className="space-y-6">
                  {showConfigError && (
                    <div className="p-6 bg-red-50 border border-red-200 rounded-3xl animate-in fade-in zoom-in duration-300">
                       <h3 className="text-red-800 font-black text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                         <span className="text-xl">⚠️</span> {errorType === 'rls' ? 'Security Policy Violation' : 'Configuration Required'}
                       </h3>
                       <p className="text-xs text-red-600 leading-relaxed font-medium">
                         {errorType === 'rls' 
                           ? 'The bucket exists, but Row-Level Security (RLS) policies prevent unauthenticated uploads.' 
                           : 'The workshop-attachments bucket is missing from your project storage.'}
                       </p>
                       <div className="mt-4 p-3 bg-white/50 rounded-xl border border-red-100">
                          <p className="text-[10px] font-black text-red-700 uppercase mb-2">Institutional Fix (SQL Editor):</p>
                          <code className="text-[9px] text-red-500 block leading-tight overflow-x-auto whitespace-pre">
                            {errorType === 'rls' 
                              ? `CREATE POLICY "Public Upload" \nON storage.objects FOR INSERT \nWITH CHECK (bucket_id = 'workshop-attachments');`
                              : `Go to Dashboard > Storage > New bucket\nName: workshop-attachments\nPublic: YES`}
                          </code>
                       </div>
                       <p className="text-[9px] text-red-400 mt-2 font-bold uppercase tracking-tighter">Refer to services/supabaseClient.ts for the full fix script.</p>
                    </div>
                  )}
                  <div className="flex flex-col gap-4">
                     <input
                       type="file"
                       ref={fileInputRef}
                       onChange={handleFileUpload}
                       className="hidden"
                       accept=".pdf,.xls,.xlsx,.doc,.docx,image/*"
                     />
                     <button
                       type="button"
                       onClick={() => fileInputRef.current?.click()}
                       disabled={isUploading}
                       className="w-full px-6 py-6 border-2 border-dashed border-indigo-100 bg-indigo-50/20 text-indigo-600 rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-indigo-50 hover:border-indigo-300 transition-all flex flex-col items-center justify-center gap-2 group"
                     >
                       <span className="text-2xl group-hover:scale-110 transition-transform">{isUploading ? '⌛' : '📎'}</span>
                       {isUploading ? 'Uploading Archive...' : 'Attach Supplemental Data'}
                     </button>
                     
                     {formData.attachmentName && (
                       <div className="flex items-center justify-between bg-white px-5 py-4 rounded-2xl border border-indigo-100 shadow-sm animate-in zoom-in-95 duration-200">
                          <div className="flex items-center gap-3 overflow-hidden">
                             <span className="text-xl">📄</span>
                             <div className="overflow-hidden">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Archive</p>
                               <p className="text-xs font-bold text-indigo-700 truncate">{formData.attachmentName}</p>
                             </div>
                          </div>
                          <button 
                           type="button" 
                           onClick={() => setFormData(prev => ({ ...prev, attachmentUrl: undefined, attachmentName: undefined }))}
                           className="w-8 h-8 rounded-full bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shrink-0"
                          >
                            ✕
                          </button>
                       </div>
                     )}
                  </div>
                  <p className="text-[10px] text-slate-400 italic text-center font-medium leading-relaxed">
                    Institutional records support Excel spreadsheets, PDF reports, and High-Definition media attachments.
                  </p>
               </div>
            </section>
          </div>
        </div>

        {/* Global Control Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 px-12 py-6 flex justify-between items-center z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          <button
            type="button"
            onClick={() => navigate(isEditMode ? `/workshop/${id}` : '/inventory')}
            className="px-8 py-3 text-slate-500 font-bold hover:text-slate-800 transition-all uppercase tracking-widest text-xs"
          >
            Abandon Changes
          </button>
          <button
            type="submit"
            className="px-16 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/20 active:scale-[0.98]"
          >
            {isEditMode ? 'Authorize Update' : 'Finalize Cataloging'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddWorkshop;

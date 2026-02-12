
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Workshop, WorkshopCategory, Speaker, AgendaItem, BudgetItem } from '../types';

interface AddWorkshopProps {
  onAddWorkshop: (w: Workshop) => void;
  onUpdateWorkshop?: (w: Workshop) => void;
  workshops: Workshop[];
}

const AddWorkshop: React.FC<AddWorkshopProps> = ({ onAddWorkshop, onUpdateWorkshop, workshops }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  
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
                  <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest w-12 text-center">#</th>
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
                    <td className="p-4 text-xs font-black text-slate-300 text-center">{(idx + 1).toString().padStart(2, '0')}</td>
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
                value={formData.budget.allocated}
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
                        value={expense.amount}
                        onChange={(e) => handleBudgetExpenseChange(idx, 'amount', Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm font-black text-slate-800 text-right"
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
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
                    className="flex-1 px-4 py-2 bg-transparent border-none focus:ring-0 outline-none font-bold text-slate-700"
                  />
                  <button type="button" onClick={() => removeItem('activities', idx)} className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">✕</button>
                </div>
              ))}
              <button type="button" onClick={() => addItem('activities', '')} className="w-full py-4 bg-amber-50 text-amber-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-amber-100 transition-all">
                + New Training Module
              </button>
            </div>
          </section>
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

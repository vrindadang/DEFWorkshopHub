import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WorkshopInventory from './pages/WorkshopInventory';
import WorkshopDetail from './pages/WorkshopDetail';
import ProcessReport from './pages/ProcessReport';
import CompareData from './pages/CompareData';
import AddWorkshop from './pages/AddWorkshop';
import { Workshop } from './types';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to map DB record to Frontend State
  const ensureWorkshopDefaults = (w: any): Workshop => {
    // Map either 'actionPlan' or 'actionplan' to the frontend 'actionPlan' property
    const dbActionPlan = w.actionPlan || w.actionplan || [];
    
    return {
      id: w.id,
      title: w.title || 'Untitled',
      theme: w.theme || '',
      category: w.category || 'General',
      lead: w.lead || '',
      date: w.date || new Date().toISOString().split('T')[0],
      venue: w.venue || '',
      frequency: w.frequency || 'One-time',
      agenda: Array.isArray(w.agenda) ? w.agenda : [],
      speakers: Array.isArray(w.speakers) ? w.speakers : [],
      activities: Array.isArray(w.activities) ? w.activities : [],
      metrics: w.metrics || { participantCount: 0, demographic: '' },
      feedback: w.feedback || { averageRating: 0, qualitativeComments: [] },
      budget: w.budget || { allocated: 0, expenses: [] },
      actionPlan: Array.isArray(dbActionPlan) ? dbActionPlan : []
    };
  };

  // Helper to map State to DB format (matching the user's provided schema)
  const prepareForDatabase = (w: Workshop) => {
    // Return the object as-is because the Workshop interface matches the camelCase schema
    return w;
  };

  useEffect(() => {
    let isMounted = true;

    const fetchWorkshops = async () => {
      try {
        console.log("Archive Hub: Initiating Cloud Sync...");
        
        const { data, error } = await supabase
          .from('workshops')
          .select('*')
          .order('date', { ascending: false });

        if (error) {
          throw error;
        }

        if (!isMounted) return;

        if (data) {
          console.log(`Archive Hub: Sync successful. ${data.length} records retrieved.`);
          setWorkshops(data.map(ensureWorkshopDefaults));
        }
      } catch (err: any) {
        console.error("Archive Hub Sync Error:", err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchWorkshops();
    return () => { isMounted = false; };
  }, []);

  const addWorkshop = async (newWorkshop: Workshop) => {
    setWorkshops(prev => [newWorkshop, ...prev]);
    
    try {
      const dbPayload = prepareForDatabase(newWorkshop);
      const { error } = await supabase
        .from('workshops')
        .insert([dbPayload]);
      
      if (error) {
        console.error("Archive Hub Persistence Error:", error.message);
        setWorkshops(prev => prev.filter(w => w.id !== newWorkshop.id));
        alert(`Institutional Alert: Record for "${newWorkshop.title}" failed to save to cloud.`);
      } else {
        console.log("Archive Hub: Record successfully committed to cloud storage.");
      }
    } catch (err) {
      console.error("Archive Hub: Critical storage failure.", err);
    }
  };

  const updateWorkshop = async (updatedWorkshop: Workshop) => {
    const originalWorkshops = [...workshops];
    setWorkshops(prev => prev.map(w => w.id === updatedWorkshop.id ? updatedWorkshop : w));
    
    try {
      const dbPayload = prepareForDatabase(updatedWorkshop);
      const { error } = await supabase
        .from('workshops')
        .update(dbPayload)
        .eq('id', updatedWorkshop.id);
      
      if (error) {
        console.error("Archive Hub Update Error:", error.message);
        setWorkshops(originalWorkshops);
        alert(`Institutional Alert: Changes to "${updatedWorkshop.title}" failed to save.`);
      }
    } catch (err) {
      console.error("Archive Hub: Critical update failure.", err);
    }
  };

  const deleteWorkshop = async (id: string) => {
    const originalWorkshops = [...workshops];
    setWorkshops(prev => prev.filter(w => w.id !== id));
    
    try {
      const { error } = await supabase
        .from('workshops')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Archive Hub Deletion Error:", error.message);
        setWorkshops(originalWorkshops);
      }
    } catch (err) {
      console.error("Archive Hub: Critical deletion failure.", err);
      setWorkshops(originalWorkshops);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 min-h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
        <p className="text-indigo-900 font-bold font-serif tracking-widest uppercase text-[10px] animate-pulse">
          Synchronizing Archives...
        </p>
      </div>
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard workshops={workshops} />} />
          <Route path="/inventory" element={<WorkshopInventory workshops={workshops} />} />
          <Route path="/workshop/:id" element={<WorkshopDetail workshops={workshops} onDeleteWorkshop={deleteWorkshop} />} />
          <Route path="/process" element={<ProcessReport onAddWorkshop={addWorkshop} />} />
          <Route path="/add" element={<AddWorkshop onAddWorkshop={addWorkshop} workshops={workshops} />} />
          <Route path="/edit/:id" element={<AddWorkshop onAddWorkshop={addWorkshop} onUpdateWorkshop={updateWorkshop} workshops={workshops} />} />
          <Route path="/compare" element={<CompareData workshops={workshops} />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WorkshopInventory from './pages/WorkshopInventory';
import WorkshopDetail from './pages/WorkshopDetail';
import ProcessReport from './pages/ProcessReport';
import CompareData from './pages/CompareData';
import AddWorkshop from './pages/AddWorkshop';
import { INITIAL_WORKSHOPS } from './constants';
import { Workshop } from './types';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const ensureWorkshopDefaults = (w: any): Workshop => ({
    ...w,
    agenda: Array.isArray(w.agenda) ? w.agenda : [],
    speakers: Array.isArray(w.speakers) ? w.speakers : [],
    activities: Array.isArray(w.activities) ? w.activities : [],
    metrics: w.metrics || { participantCount: 0, demographic: '' },
    feedback: w.feedback || { averageRating: 0, qualitativeComments: [] },
    budget: w.budget || { allocated: 0, expenses: [] },
    actionPlan: Array.isArray(w.actionPlan) ? w.actionPlan : []
  });

  useEffect(() => {
    let isMounted = true;

    const fetchWorkshops = async () => {
      try {
        console.log("Archive Hub: Connecting to cloud services...");
        
        const { data, error } = await supabase
          .from('workshops')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;

        if (!isMounted) return;

        if (data && data.length > 0) {
          setWorkshops(data.map(ensureWorkshopDefaults));
        } else {
          console.warn("Archive Hub: Cloud is empty. Seeding baseline data...");
          const { error: upsertError } = await supabase
            .from('workshops')
            .upsert(INITIAL_WORKSHOPS, { onConflict: 'id' });
          
          if (!upsertError && isMounted) {
             setWorkshops(INITIAL_WORKSHOPS);
          }
        }
      } catch (err) {
        console.error("Archive Hub: Cloud sync unavailable. Using offline baseline.", err);
        if (isMounted) setWorkshops(INITIAL_WORKSHOPS);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchWorkshops();
    return () => { isMounted = false; };
  }, []);

  const addWorkshop = async (newWorkshop: Workshop) => {
    setWorkshops(prev => [...prev, newWorkshop]);
    try {
      await supabase.from('workshops').insert(newWorkshop);
    } catch (err) {
      console.error("Archive Hub: Persist failed.", err);
    }
  };

  const updateWorkshop = async (updatedWorkshop: Workshop) => {
    setWorkshops(prev => prev.map(w => w.id === updatedWorkshop.id ? updatedWorkshop : w));
    try {
      await supabase.from('workshops').update(updatedWorkshop).eq('id', updatedWorkshop.id);
    } catch (err) {
      console.error("Archive Hub: Update failed.", err);
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
          <Route path="/workshop/:id" element={<WorkshopDetail workshops={workshops} />} />
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
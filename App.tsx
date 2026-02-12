
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

  // Helper to ensure all required fields are present and correctly typed
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

  // Sync data from Supabase on mount
  useEffect(() => {
    let isMounted = true;

    const fetchWorkshops = async () => {
      try {
        console.log("Archive Hub: Initiating sync with Supabase...");
        
        // 1. Fetch current records
        const { data, error } = await supabase
          .from('workshops')
          .select('*')
          .order('date', { ascending: false });

        if (error) {
          console.error("Archive Hub: Supabase Connection Error ->", error.message);
          throw error;
        }

        if (!isMounted) return;

        // 2. Check if table is empty
        if (data && data.length > 0) {
          console.log(`Archive Hub: Sync Complete. ${data.length} records retrieved from cloud.`);
          const sanitized = data.map(ensureWorkshopDefaults);
          setWorkshops(sanitized);
        } else {
          console.warn("Archive Hub: Cloud archive is empty. Triggering automated seed...");
          
          // Seed the database with the baseline data
          const { error: upsertError } = await supabase
            .from('workshops')
            .upsert(INITIAL_WORKSHOPS, { onConflict: 'id' });
          
          if (upsertError) {
            console.error("Archive Hub: Automated seed failed. Data remaining in local session.", upsertError.message);
          } else {
            console.log("Archive Hub: Baseline data successfully migrated to cloud.");
          }
          
          if (isMounted) setWorkshops(INITIAL_WORKSHOPS);
        }
      } catch (err) {
        console.error("Archive Hub: Operating in Offline Fallback Mode. Database connection could not be established.");
        if (isMounted) setWorkshops(INITIAL_WORKSHOPS);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchWorkshops();
    return () => { isMounted = false; };
  }, []);

  const addWorkshop = async (newWorkshop: Workshop) => {
    // Optimistic UI update
    setWorkshops(prev => [...prev, newWorkshop]);
    try {
      const { error } = await supabase
        .from('workshops')
        .insert(newWorkshop);
      
      if (error) throw error;
      console.log(`Archive Hub: Successfully persisted new entry [${newWorkshop.id}] to cloud.`);
    } catch (err: any) {
      console.error("Archive Hub: Failed to persist new entry. Local state preserved.", err.message);
    }
  };

  const updateWorkshop = async (updatedWorkshop: Workshop) => {
    setWorkshops(prev => prev.map(w => w.id === updatedWorkshop.id ? updatedWorkshop : w));
    try {
      const { error } = await supabase
        .from('workshops')
        .update(updatedWorkshop)
        .eq('id', updatedWorkshop.id);
      
      if (error) throw error;
      console.log(`Archive Hub: Successfully updated entry [${updatedWorkshop.id}] in cloud.`);
    } catch (err: any) {
      console.error("Archive Hub: Failed to update entry. Local state preserved.", err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="relative">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 bg-indigo-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="text-indigo-900 font-bold font-serif tracking-[0.3em] uppercase text-[10px] mt-6 animate-pulse">
          Synchronizing Hub Archives
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

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

  // Helper to map DB record (lowercase actionplan) to State (camelCase actionPlan)
  const ensureWorkshopDefaults = (w: any): Workshop => {
    const { actionplan, actionPlan, ...rest } = w;
    return {
      ...rest,
      agenda: Array.isArray(w.agenda) ? w.agenda : [],
      speakers: Array.isArray(w.speakers) ? w.speakers : [],
      activities: Array.isArray(w.activities) ? w.activities : [],
      metrics: w.metrics || { participantCount: 0, demographic: '' },
      feedback: w.feedback || { averageRating: 0, qualitativeComments: [] },
      budget: w.budget || { allocated: 0, expenses: [] },
      // Check both cases to be resilient to DB naming
      actionPlan: Array.isArray(actionPlan) ? actionPlan : (Array.isArray(actionplan) ? actionplan : [])
    };
  };

  // Helper to map State to DB format
  const prepareForDatabase = (w: Workshop) => {
    const { actionPlan, ...rest } = w;
    return {
      ...rest,
      actionplan: actionPlan // Map to lowercase as per user SQL schema
    };
  };

  useEffect(() => {
    let isMounted = true;

    const fetchWorkshops = async () => {
      try {
        console.log("Archive Hub: Connecting to cloud services...");
        
        const { data, error } = await supabase
          .from('workshops')
          .select('*')
          .order('date', { ascending: false });

        if (error) {
          console.error("Supabase Fetch Error:", error.message);
          throw error;
        }

        if (!isMounted) return;

        if (data && data.length > 0) {
          console.log(`Archive Hub: Sync complete. ${data.length} records retrieved.`);
          setWorkshops(data.map(ensureWorkshopDefaults));
        } else {
          console.log("Archive Hub: No records found in cloud.");
          setWorkshops([]);
        }
      } catch (err) {
        console.error("Archive Hub: Cloud sync unavailable.", err);
        if (isMounted) setWorkshops([]);
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
      if (error) console.error("Archive Hub: Sync Insert Error:", error.message);
    } catch (err) {
      console.error("Archive Hub: Critical persist failure.", err);
    }
  };

  const updateWorkshop = async (updatedWorkshop: Workshop) => {
    setWorkshops(prev => prev.map(w => w.id === updatedWorkshop.id ? updatedWorkshop : w));
    try {
      const dbPayload = prepareForDatabase(updatedWorkshop);
      const { error } = await supabase
        .from('workshops')
        .update(dbPayload)
        .eq('id', updatedWorkshop.id);
      if (error) console.error("Archive Hub: Sync Update Error:", error.message);
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
        console.error("Archive Hub: Sync Delete Error:", error.message);
        setWorkshops(originalWorkshops); // Rollback on failure
      }
    } catch (err) {
      console.error("Archive Hub: Critical delete failure.", err);
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
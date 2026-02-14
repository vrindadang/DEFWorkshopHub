import { createClient } from '@supabase/supabase-js';

/**
 * DARSHAN HUB - CLOUD PERSISTENCE SETUP
 * 
 * To ensure your workshops are saved and persist after a refresh, 
 * copy and execute the following SQL in your Supabase SQL Editor:
 * 
 * ------------------------------------------------------------------
 * -- 1. Create (or update) the workshops table
 * CREATE TABLE IF NOT EXISTS public.workshops (
 *   id text NOT NULL,
 *   title text NOT NULL,
 *   theme text,
 *   category text NOT NULL,
 *   lead text NOT NULL,
 *   date date NOT NULL,
 *   venue text,
 *   frequency text,
 *   agenda jsonb DEFAULT '[]'::jsonb,
 *   speakers jsonb DEFAULT '[]'::jsonb,
 *   activities jsonb DEFAULT '[]'::jsonb,
 *   metrics jsonb DEFAULT '{"participantCount": 0, "demographic": ""}'::jsonb,
 *   feedback jsonb DEFAULT '{"averageRating": 0, "qualitativeComments": []}'::jsonb,
 *   budget jsonb DEFAULT '{"allocated": 0, "expenses": []}'::jsonb,
 *   "actionPlan" jsonb DEFAULT '[]'::jsonb, -- Use double quotes for camelCase preservation
 *   created_at timestamp with time zone DEFAULT now(),
 *   CONSTRAINT workshops_pkey PRIMARY KEY (id)
 * );
 * 
 * -- 2. Enable Row Level Security (RLS)
 * ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
 * 
 * -- 3. Create a public access policy (Allows anyone to Read/Write/Delete)
 * DROP POLICY IF EXISTS "Public Full Access" ON public.workshops;
 * CREATE POLICY "Public Full Access" ON public.workshops 
 * FOR ALL 
 * USING (true) 
 * WITH CHECK (true);
 * ------------------------------------------------------------------
 */

const supabaseUrl = 'https://lhetucfujitjisywjwkp.supabase.co';
const supabaseKey = 'sb_publishable_-FoCa_l-eD4Guvr1_M-t6w_oOY8i0XP';

export const supabase = createClient(supabaseUrl, supabaseKey);
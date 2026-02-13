
import { createClient } from '@supabase/supabase-js';

/**
 * DATABASE SETUP INSTRUCTIONS:
 * 
 * 1. RUN SCHEMA DEFINITION:
 * CREATE TABLE IF NOT EXISTS workshops (
 *   id TEXT PRIMARY KEY,
 *   title TEXT NOT NULL,
 *   theme TEXT,
 *   category TEXT NOT NULL,
 *   lead TEXT NOT NULL,
 *   date DATE NOT NULL,
 *   venue TEXT,
 *   frequency TEXT,
 *   agenda JSONB DEFAULT '[]'::jsonb,
 *   speakers JSONB DEFAULT '[]'::jsonb,
 *   activities JSONB DEFAULT '[]'::jsonb,
 *   metrics JSONB DEFAULT '{}'::jsonb,
 *   feedback JSONB DEFAULT '{}'::jsonb,
 *   budget JSONB DEFAULT '{}'::jsonb,
 *   actionPlan JSONB DEFAULT '[]'::jsonb,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * 2. ENABLE SECURITY:
 * ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Enable all access for everyone" ON workshops FOR ALL USING (true) WITH CHECK (true);
 * 
 * 3. ENVIRONMENT VARIABLES:
 * Ensure the following are set in your deployment environment:
 * - process.env.API_KEY (for Gemini AI)
 * - process.env.SUPABASE_URL (from Supabase project settings)
 * - process.env.SUPABASE_ANON_KEY (from Supabase project settings)
 */

const supabaseUrl = process.env.SUPABASE_URL || 'https://lhetucfujitjisywjwkp.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_-FoCa_l-eD4Guvr1_M-t6w_oOY8i0XP';

export const supabase = createClient(supabaseUrl, supabaseKey);

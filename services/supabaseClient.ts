
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
 * 3. MANUAL DATA INSERTION (Run this if cloud is empty):
 * INSERT INTO workshops (id, title, theme, category, lead, date, venue, frequency, agenda, speakers, activities, metrics, feedback, budget, actionPlan)
 * VALUES ('1', 'Nurturing the Soul: Spiritual Curriculum 2024', '...', 'Spiritual Curriculum', 'Dr. Anita Sharma', '2024-03-15', '...', 'Annual', '[]', '[]', '[]', '{}', '{}', '{}', '[]')
 * ON CONFLICT (id) DO NOTHING;
 */

const supabaseUrl = 'https://lhetucfujitjisywjwkp.supabase.co';
const supabaseKey = 'sb_publishable_-FoCa_l-eD4Guvr1_M-t6w_oOY8i0XP';

export const supabase = createClient(supabaseUrl, supabaseKey);

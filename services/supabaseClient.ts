
import { createClient } from '@supabase/supabase-js';

/**
 * DARSHAN ACADEMY WORKSHOP HUB - INFRASTRUCTURE SETUP
 * 
 * FIXING "row violates row-level security policy" ERROR:
 * ------------------------------------------------------------------
 * This error occurs because the bucket exists but doesn't allow uploads.
 * 
 * RESOLUTION STEPS (SQL Editor):
 * Copy and run this in your Supabase SQL Editor:
 * 
 * -- 1. Allow public uploads to 'workshop-attachments'
 * CREATE POLICY "Public Upload" 
 * ON storage.objects FOR INSERT 
 * WITH CHECK (bucket_id = 'workshop-attachments');
 * 
 * -- 2. Allow public viewing of files
 * CREATE POLICY "Public View" 
 * ON storage.objects FOR SELECT 
 * USING (bucket_id = 'workshop-attachments');
 * 
 * -- 3. Allow public updates/deletes (Institutional Management)
 * CREATE POLICY "Public Update" 
 * ON storage.objects FOR UPDATE 
 * USING (bucket_id = 'workshop-attachments');
 * 
 * CREATE POLICY "Public Delete" 
 * ON storage.objects FOR DELETE 
 * USING (bucket_id = 'workshop-attachments');
 * 
 * ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Public Full Access" ON public.workshops FOR ALL USING (true) WITH CHECK (true);
 * ------------------------------------------------------------------
 */

const supabaseUrl = 'https://lhetucfujitjisywjwkp.supabase.co';
const supabaseKey = 'sb_publishable_-FoCa_l-eD4Guvr1_M-t6w_oOY8i0XP';

export const supabase = createClient(supabaseUrl, supabaseKey);

import { createClient } from '@supabase/supabase-js';

// Default placeholders that won't crash the constructor if env vars are missing
const DEFAULT_URL = 'https://lhetucfujitjisywjwkp.supabase.co';
const DEFAULT_KEY = 'sb_publishable_-FoCa_l-eD4Guvr1_M-t6w_oOY8i0XP';

const supabaseUrl = process.env.SUPABASE_URL || DEFAULT_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || DEFAULT_KEY;

// Ensure the URL is valid before creating the client to prevent top-level errors
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const finalUrl = isValidUrl(supabaseUrl) ? supabaseUrl : DEFAULT_URL;

export const supabase = createClient(finalUrl, supabaseKey);
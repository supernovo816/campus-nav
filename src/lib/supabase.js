import { createClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────────
// Supabase client configuration
// Replace these values with your actual Supabase
// project URL and anon/public key.
// NEVER put the service-role key here.
// ─────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rjxgeboozisiuvgqnrer.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqeGdlYm9vemlzaXV2Z3FucmVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MjIzNzgsImV4cCI6MjA5MTM5ODM3OH0.GlV73pv9SxciWnCJdCRdMKLpedGkXLC2zjFSppfiN6A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

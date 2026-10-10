import { createClient } from '@supabase/supabase-js';

// Check both VITE_ prefix (local dev) and NEXT_PUBLIC_ prefix (Vercel Supabase integration)
// with direct fallback to ensure production availability
const supabaseUrl = (
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://rrhifzpkrmdyqrlabktr.supabase.co'
).trim();

const supabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyaGlmenBrcm1keXFybGFia3RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MjA5NTEsImV4cCI6MjEwNzE5Njk1MX0.hOk6pIBl0UQhv-qCIn6RPDSRFqgtwosN7hxcV9k8tcs'
).trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here'
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;

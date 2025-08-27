
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables - some features may not work');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!supabase;

console.log('Environment check:');
console.log('- Supabase URL configured:', !!supabaseUrl);
console.log('- Supabase Key configured:', !!supabaseAnonKey);

if (supabase) {
  console.log('Supabase client initialized successfully');
} else {
  console.log('Supabase configuration incomplete:');
  console.log('- Valid URL:', !!supabaseUrl && supabaseUrl.startsWith('https://'));
  console.log('- Valid Key:', !!supabaseAnonKey && supabaseAnonKey.length > 20);
  console.log('Running in demo mode without Supabase');
}

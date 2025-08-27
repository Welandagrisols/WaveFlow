
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('Environment check:');
console.log('- Supabase URL configured:', !!supabaseUrl);
console.log('- Supabase Key configured:', !!supabaseAnonKey);

// Validate configuration
const isValidUrl = supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co');
const isValidKey = supabaseAnonKey.length > 100; // Supabase keys are typically much longer

console.log('Supabase configuration validation:');
console.log('- Valid URL:', isValidUrl);
console.log('- Valid Key:', isValidKey);

let supabase = null;

if (isValidUrl && isValidKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase client initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
    supabase = null;
  }
} else {
  console.log('⚠️ Supabase configuration incomplete - running in demo mode');
}

export { supabase };
export const isSupabaseConfigured = !!(supabase && isValidUrl && isValidKey);

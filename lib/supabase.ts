
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('Supabase configuration check:');
console.log('- URL configured:', !!supabaseUrl);
console.log('- Key configured:', !!supabaseAnonKey);

// Validate configuration
const isValidUrl = supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co');
const isValidKey = supabaseAnonKey.startsWith('eyJ') && supabaseAnonKey.length > 50;

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
  console.log('⚠️ Supabase configuration incomplete - please check environment variables');
}

export { supabase };
export const isSupabaseConfigured = !!(supabase && isValidUrl && isValidKey);

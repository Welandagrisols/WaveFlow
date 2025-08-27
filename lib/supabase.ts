
import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

// In development mode, use mock configuration
const isDevelopment = process.env.NODE_ENV === 'development';

// Only validate in production
if (!isDevelopment && (!supabaseUrl || supabaseUrl === 'https://demo.supabase.co')) {
  console.warn('Supabase not configured, running in demo mode');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

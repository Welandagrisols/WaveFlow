
import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Raw process.env.NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

// Validate URL format
const isValidUrl = supabaseUrl && supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co');

// Export supabase client or null based on validation
export const supabase = !isValidUrl 
  ? (() => {
      console.warn('Invalid Supabase URL format. Expected: https://xxx.supabase.co');
      console.warn('Running in demo mode without Supabase');
      return null;
    })()
  : createClient(supabaseUrl, supabaseKey || '');

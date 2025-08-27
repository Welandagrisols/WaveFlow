
import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('Environment check:');
console.log('- Supabase URL configured:', !!supabaseUrl && supabaseUrl !== 'NEXT_PUBLIC_SUPABASE_URL');
console.log('- Supabase Key configured:', !!supabaseKey && supabaseKey !== 'NEXT_PUBLIC_SUPABASE_ANON_KEY');

// Validate URL format - check if we have real values, not placeholder text
const hasValidUrl = supabaseUrl && 
                   supabaseUrl !== 'NEXT_PUBLIC_SUPABASE_URL' && 
                   supabaseUrl.startsWith('https://') && 
                   supabaseUrl.includes('.supabase.co');

const hasValidKey = supabaseKey && 
                   supabaseKey !== 'NEXT_PUBLIC_SUPABASE_ANON_KEY' && 
                   supabaseKey.length > 10;

// Export supabase client or null based on validation
export const supabase = (!hasValidUrl || !hasValidKey)
  ? (() => {
      console.warn('Supabase configuration incomplete:');
      console.warn('- Valid URL:', hasValidUrl);
      console.warn('- Valid Key:', hasValidKey);
      console.warn('Running in demo mode without Supabase');
      return null;
    })()
  : createClient(supabaseUrl, supabaseKey);

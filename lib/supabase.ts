import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks for development
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
let supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('Environment check:');
console.log('- Supabase URL configured:', !!supabaseUrl && supabaseUrl !== 'NEXT_PUBLIC_SUPABASE_URL');
console.log('- Supabase Key configured:', !!supabaseKey && supabaseKey !== 'NEXT_PUBLIC_SUPABASE_ANON_KEY');

// Validate URL format - check if we have real values, not placeholder text
const hasValidUrl = supabaseUrl &&
                   supabaseUrl !== 'NEXT_PUBLIC_SUPABASE_URL' &&
                   supabaseUrl !== 'NEXT_PUBLIC_SUPABASE_URL/' &&
                   supabaseUrl.startsWith('https://') &&
                   supabaseUrl.includes('.supabase.co');

const hasValidKey = supabaseKey &&
                   supabaseKey !== 'NEXT_PUBLIC_SUPABASE_ANON_KEY' &&
                   supabaseKey.length > 10;

// Environment validation
if (!hasValidUrl || !hasValidKey) {
  console.log('Supabase configuration incomplete:');
  console.log('- Valid URL:', hasValidUrl);
  console.log('- Valid Key:', hasValidKey);
  console.log('Running in demo mode without Supabase');
}

export const supabase = hasValidUrl && hasValidKey ? createClient(supabaseUrl, supabaseKey) : null;
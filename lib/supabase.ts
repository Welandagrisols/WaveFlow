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
                   supabaseUrl.startsWith('https://') &&
                   supabaseUrl.includes('.supabase.co');

const hasValidKey = supabaseKey &&
                   supabaseKey !== 'NEXT_PUBLIC_SUPABASE_ANON_KEY' &&
                   supabaseKey.length > 10;

// Environment validation
if (!supabaseUrl || !supabaseKey) {
  console.log('Environment check:');
  console.log('- Supabase URL configured:', !!supabaseUrl);
  console.log('- Supabase Key configured:', !!supabaseKey);

  if (!supabaseUrl || !supabaseKey) {
    console.log('Supabase configuration incomplete:');
    console.log('- Valid URL:', !!supabaseUrl);
    console.log('- Valid Key:', !!supabaseKey);
    console.log('Running in demo mode without Supabase');

    // Use dummy values for demo mode
    supabaseUrl = 'https://demo.supabase.co';
    supabaseKey = 'demo-key';
  }
}

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
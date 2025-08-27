import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

// Only validate in production or when real environment variables are provided
const isDevelopment = process.env.NODE_ENV === 'development';
const hasRealConfig = supabaseUrl !== 'https://placeholder.supabase.co' && supabaseKey !== 'placeholder-key';

if (!isDevelopment && (!supabaseUrl || !supabaseKey)) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

if (hasRealConfig && (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co'))) {
  console.error('Invalid Supabase URL format. Expected: https://xxx.supabase.co');
  throw new Error('Invalid Supabase URL format. Expected: https://xxx.supabase.co');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
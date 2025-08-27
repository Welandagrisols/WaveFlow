import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Supabase configuration check:');
  console.log('- URL configured:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('- Key configured:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return res.status(500).json({ error: 'Supabase configuration missing' });
  }

  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseKey) {
    return res.status(500).json({ error: 'Supabase key configuration missing' });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey
  );

  try {
    console.log('✅ Supabase client initialized successfully');

    if (req.method === 'GET') {
      // Redirect to Supabase Auth URL or return auth status
      return res.status(200).json({ 
        message: "Please use client-side authentication", 
        authUrl: "/auth/login" 
      });
    }

    if (req.method === 'POST') {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(401).json({ error: error.message });
      }

      return res.status(200).json({ user: data.user, session: data.session });
    }

    // Method not allowed
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
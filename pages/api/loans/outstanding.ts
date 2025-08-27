
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

  if (req.method === 'GET') {
    try {
      // Mock data for now since loans table doesn't exist yet
      const mockLoans = {
        totalOutstanding: 0,
        loans: [],
        count: 0
      };

      return res.status(200).json(mockLoans);

    } catch (error) {
      console.error('API error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}

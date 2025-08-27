
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
      const { dates } = req.query;
      const [startDate, endDate] = dates as string[];

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('is_personal', true)
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate)
        .order('transaction_date', { ascending: false });

      if (error) {
        console.error('Personal expenses fetch error:', error);
        return res.status(500).json({ error: error.message });
      }

      const summary = {
        totalExpenses: transactions?.filter(t => t.direction === 'OUT').reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0,
        totalIncome: transactions?.filter(t => t.direction === 'IN').reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0,
        transactionCount: transactions?.length || 0,
        transactions: transactions || []
      };

      return res.status(200).json(summary);

    } catch (error) {
      console.error('API error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}

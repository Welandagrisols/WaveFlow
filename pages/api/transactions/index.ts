
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

async function getAuthenticatedUser(req: NextApiRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ') || !supabase) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  return error || !user ? null : user;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!supabase) {
    return res.status(500).json({ message: 'Database not configured' });
  }

  if (req.method === 'GET') {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          *,
          categories!inner(name, color)
        `)
        .eq('userId', user.id)
        .order('transactionDate', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      res.json(transactions);
    } catch (error) {
      console.error('Transactions fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch transactions' });
    }
  } else if (req.method === 'POST') {
    try {
      const transactionData = { ...req.body, userId: user.id };
      
      const { data: transaction, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) throw error;
      res.json(transaction);
    } catch (error) {
      console.error('Transaction creation error:', error);
      res.status(500).json({ message: 'Failed to create transaction' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

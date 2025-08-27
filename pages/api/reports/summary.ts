
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!supabase) {
    return res.status(500).json({ message: 'Database not configured' });
  }

  if (req.method === 'GET') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { startDate, endDate } = req.query;
      
      let query = supabase
        .from('transactions')
        .select('amount, direction')
        .eq('user_id', user.id);

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data: transactions, error } = await query;

      if (error) throw error;

      const summary = transactions?.reduce((acc, transaction) => {
        if (transaction.direction === 'in') {
          acc.totalIncome += parseFloat(transaction.amount);
        } else {
          acc.totalExpenses += parseFloat(transaction.amount);
        }
        acc.transactionCount++;
        return acc;
      }, { totalIncome: 0, totalExpenses: 0, transactionCount: 0 }) || 
      { totalIncome: 0, totalExpenses: 0, transactionCount: 0 };

      res.json(summary);
    } catch (error) {
      console.error('Error fetching transaction summary:', error);
      res.status(500).json({ message: 'Failed to fetch transaction summary' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

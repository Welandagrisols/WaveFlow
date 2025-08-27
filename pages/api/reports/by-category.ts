
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
        .select(`
          amount,
          categories!inner(name)
        `)
        .eq('user_id', user.id);

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data: transactions, error } = await query;

      if (error) throw error;

      const categoryData = transactions?.reduce((acc: any[], transaction: any) => {
        const categoryName = transaction.categories.name;
        const existing = acc.find(item => item.categoryName === categoryName);
        
        if (existing) {
          existing.amount += parseFloat(transaction.amount);
          existing.count++;
        } else {
          acc.push({
            categoryName,
            amount: parseFloat(transaction.amount),
            count: 1
          });
        }
        
        return acc;
      }, []) || [];

      res.json(categoryData);
    } catch (error) {
      console.error('Error fetching transactions by category:', error);
      res.status(500).json({ message: 'Failed to fetch transactions by category' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

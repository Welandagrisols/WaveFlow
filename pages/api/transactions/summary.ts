import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

type SupabaseClient = typeof supabase;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = supabase as SupabaseClient;
  if (!client) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  if (req.method === 'GET') {
    try {
      const { startDate, endDate } = req.query;

      let query = client
        .from('transactions')
        .select('amount, direction, currency, is_personal, transaction_date');

      if (startDate) {
        query = query.gte('transaction_date', startDate as string);
      }
      if (endDate) {
        query = query.lte('transaction_date', endDate as string);
      }

      const { data: transactions, error } = await query;

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      // Calculate summary
      const summary = {
        totalIncome: 0,
        totalExpenses: 0,
        businessIncome: 0,
        businessExpenses: 0,
        personalIncome: 0,
        personalExpenses: 0,
        totalTransactions: transactions?.length || 0
      };

      if (transactions) {
        transactions.forEach(transaction => {
          const amount = parseFloat(transaction.amount);
          const isPersonal = transaction.is_personal;
          const isIncome = transaction.direction === 'IN';

          if (isIncome) {
            summary.totalIncome += amount;
            if (isPersonal) {
              summary.personalIncome += amount;
            } else {
              summary.businessIncome += amount;
            }
          } else {
            summary.totalExpenses += amount;
            if (isPersonal) {
              summary.personalExpenses += amount;
            } else {
              summary.businessExpenses += amount;
            }
          }
        });
      }

      return res.status(200).json(summary);
    } catch (error) {
      console.error('Summary API error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
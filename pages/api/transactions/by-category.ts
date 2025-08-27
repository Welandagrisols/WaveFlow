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
        .select(`
          amount, 
          direction, 
          is_personal,
          transaction_date,
          categories!inner(
            id,
            name,
            color
          )
        `);

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

      // Group by category
      const categoryMap = new Map();

      if (transactions) {
        transactions.forEach(transaction => {
          const category = transaction.categories;
          const amount = parseFloat(transaction.amount);
          const categoryId = category.id;

          if (!categoryMap.has(categoryId)) {
            categoryMap.set(categoryId, {
              id: categoryId,
              name: category.name,
              color: category.color,
              totalAmount: 0,
              transactionCount: 0,
              businessAmount: 0,
              personalAmount: 0,
              incomeAmount: 0,
              expenseAmount: 0
            });
          }

          const categoryData = categoryMap.get(categoryId);
          categoryData.totalAmount += amount;
          categoryData.transactionCount += 1;

          if (transaction.is_personal) {
            categoryData.personalAmount += amount;
          } else {
            categoryData.businessAmount += amount;
          }

          if (transaction.direction === 'IN') {
            categoryData.incomeAmount += amount;
          } else {
            categoryData.expenseAmount += amount;
          }
        });
      }

      const categoryArray = Array.from(categoryMap.values())
        .sort((a, b) => b.totalAmount - a.totalAmount);

      return res.status(200).json(categoryArray);
    } catch (error) {
      console.error('Category API error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
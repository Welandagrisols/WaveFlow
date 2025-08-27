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

      // Get SMS transactions (all, regardless of confirmation status) 
      let smsQuery = client
        .from('sms_transactions')
        .select('sms_text, parsed_amount, account_type, timestamp, sim_card');

      if (startDate) {
        smsQuery = smsQuery.gte('timestamp', startDate as string);
      }
      if (endDate) {
        smsQuery = smsQuery.lte('timestamp', endDate as string);
      }

      const { data: smsTransactions, error: smsError } = await smsQuery;

      if (smsError) {
        console.error('SMS query error:', smsError);
        return res.status(500).json({ error: smsError.message });
      }

      // Group by category
      const categoryMap = new Map();

      // Process confirmed transactions
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
              expenseAmount: 0,
              confirmedAmount: 0,
              unconfirmedAmount: 0
            });
          }

          const categoryData = categoryMap.get(categoryId);
          categoryData.totalAmount += amount;
          categoryData.confirmedAmount += amount;
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

      // Process SMS transactions with auto-categorization
      if (smsTransactions) {
        smsTransactions.forEach(smsTransaction => {
          const amount = parseFloat(smsTransaction.parsed_amount) || 0;
          const isPersonal = smsTransaction.account_type === 'personal';
          
          // Auto-categorize based on SMS content
          let categoryName = 'Uncategorized';
          let categoryColor = '#6B7280';
          
          const smsText = smsTransaction.sms_text.toLowerCase();
          
          // Simple categorization logic based on keywords
          if (smsText.includes('food') || smsText.includes('restaurant') || smsText.includes('cafe')) {
            categoryName = 'Food & Beverages';
            categoryColor = '#EF4444';
          } else if (smsText.includes('fuel') || smsText.includes('petrol') || smsText.includes('gas')) {
            categoryName = 'Transportation';
            categoryColor = '#84CC16';
          } else if (smsText.includes('shop') || smsText.includes('store') || smsText.includes('mart')) {
            categoryName = 'Shopping';
            categoryColor = '#F59E0B';
          } else if (smsText.includes('rent') || smsText.includes('water') || smsText.includes('electricity')) {
            categoryName = 'Utilities & Bills';
            categoryColor = '#EF4444';
          } else if (smsText.includes('medical') || smsText.includes('hospital') || smsText.includes('clinic')) {
            categoryName = 'Healthcare';
            categoryColor = '#10B981';
          } else if (isPersonal) {
            categoryName = 'Personal Expenses';
            categoryColor = '#F97316';
          } else {
            categoryName = 'Business Expenses';
            categoryColor = '#3B82F6';
          }

          const categoryKey = categoryName;

          if (!categoryMap.has(categoryKey)) {
            categoryMap.set(categoryKey, {
              id: categoryKey,
              name: categoryName,
              color: categoryColor,
              totalAmount: 0,
              transactionCount: 0,
              businessAmount: 0,
              personalAmount: 0,
              incomeAmount: 0,
              expenseAmount: 0,
              confirmedAmount: 0,
              unconfirmedAmount: 0
            });
          }

          const categoryData = categoryMap.get(categoryKey);
          categoryData.totalAmount += amount;
          categoryData.unconfirmedAmount += amount;
          categoryData.transactionCount += 1;
          categoryData.expenseAmount += amount; // SMS transactions are typically expenses

          if (isPersonal) {
            categoryData.personalAmount += amount;
          } else {
            categoryData.businessAmount += amount;
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
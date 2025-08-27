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

      // Get SMS transactions (all, regardless of confirmation status)
      let smsQuery = client
        .from('sms_transactions')
        .select('parsed_amount, account_type, timestamp, sim_card');

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

      // Calculate summary including all transactions
      const summary = {
        totalIncome: 0,
        totalExpenses: 0,
        businessIncome: 0,
        businessExpenses: 0,
        personalIncome: 0,
        personalExpenses: 0,
        totalTransactions: (transactions?.length || 0) + (smsTransactions?.length || 0),
        confirmedTransactions: transactions?.length || 0,
        unconfirmedTransactions: smsTransactions?.length || 0,
        sim1Expenses: 0,
        sim2Expenses: 0
      };

      // Process confirmed transactions
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

      // Process SMS transactions (treat all as expenses since they're M-Pesa payments)
      if (smsTransactions) {
        smsTransactions.forEach(smsTransaction => {
          const amount = parseFloat(smsTransaction.parsed_amount) || 0;
          const isPersonal = smsTransaction.account_type === 'personal';
          
          // SMS transactions are typically outgoing payments
          summary.totalExpenses += amount;
          if (isPersonal) {
            summary.personalExpenses += amount;
          } else {
            summary.businessExpenses += amount;
          }

          // Track by SIM card
          if (smsTransaction.sim_card === 'SIM1') {
            summary.sim1Expenses += amount;
          } else if (smsTransaction.sim_card === 'SIM2') {
            summary.sim2Expenses += amount;
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
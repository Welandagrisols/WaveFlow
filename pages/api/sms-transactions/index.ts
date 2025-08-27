
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

      const { data: smsTransactions, error } = await supabase
        .from('sms_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_confirmed', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(smsTransactions || []);
    } catch (error) {
      console.error('Error fetching SMS transactions:', error);
      res.status(500).json({ message: 'Failed to fetch SMS transactions' });
    }
  } else if (req.method === 'POST') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { data: smsTransaction, error } = await supabase
        .from('sms_transactions')
        .insert({
          ...req.body,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(smsTransaction);
    } catch (error) {
      console.error('Error creating SMS transaction:', error);
      res.status(500).json({ message: 'Failed to create SMS transaction' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

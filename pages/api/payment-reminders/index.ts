
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

      const { data: reminders, error } = await supabase
        .from('payment_reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      res.json(reminders || []);
    } catch (error) {
      console.error('Error fetching payment reminders:', error);
      res.status(500).json({ message: 'Failed to fetch payment reminders' });
    }
  } else if (req.method === 'POST') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { data: reminder, error } = await supabase
        .from('payment_reminders')
        .insert({
          ...req.body,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(reminder);
    } catch (error) {
      console.error('Error creating payment reminder:', error);
      res.status(500).json({ message: 'Failed to create payment reminder' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

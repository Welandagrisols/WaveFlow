
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!supabase) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  if (req.method === 'POST') {
    try {
      const { smsText, senderNumber, simCard, accountType } = req.body;

      // Get user from session (in production, you'd verify the JWT token)
      const authHeader = req.headers.authorization;
      
      // For now, we'll use a simple approach - in production you'd verify the JWT
      const { data: smsRecord, error } = await supabase
        .from('sms_transactions')
        .insert({
          sms_text: smsText,
          sender_number: senderNumber,
          sim_card: simCard,
          account_type: accountType || 'business',
          is_processed: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({
        success: true,
        smsTransaction: smsRecord,
        message: 'SMS transaction recorded successfully'
      });

    } catch (error) {
      console.error('API error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'GET') {
    try {
      const { data: smsTransactions, error } = await supabase
        .from('sms_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(smsTransactions || []);
    } catch (error) {
      console.error('API error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

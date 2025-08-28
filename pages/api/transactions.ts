
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const { data: transactions, error: getError } = await supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false });

        if (getError) {
          return res.status(400).json({ error: getError.message });
        }

        return res.status(200).json(transactions);

      case 'POST':
        const { data: newTransaction, error: postError } = await supabase
          .from('transactions')
          .insert([req.body])
          .select()
          .single();

        if (postError) {
          return res.status(400).json({ error: postError.message });
        }

        return res.status(201).json(newTransaction);

      case 'PUT':
        const { id } = req.query;
        const { data: updatedTransaction, error: putError } = await supabase
          .from('transactions')
          .update(req.body)
          .eq('id', id)
          .select()
          .single();

        if (putError) {
          return res.status(400).json({ error: putError.message });
        }

        return res.status(200).json(updatedTransaction);

      case 'DELETE':
        const { id: deleteId } = req.query;
        const { error: deleteError } = await supabase
          .from('transactions')
          .delete()
          .eq('id', deleteId);

        if (deleteError) {
          return res.status(400).json({ error: deleteError.message });
        }

        return res.status(204).end();

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Transaction API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

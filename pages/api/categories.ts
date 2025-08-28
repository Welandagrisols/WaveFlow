import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const { data: categories, error: getError } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (getError) {
          return res.status(400).json({ error: getError.message });
        }

        return res.status(200).json(categories);

      case 'POST':
        const { data: newCategory, error: postError } = await supabase
          .from('categories')
          .insert([req.body])
          .select()
          .single();

        if (postError) {
          return res.status(400).json({ error: postError.message });
        }

        return res.status(201).json(newCategory);

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Categories API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
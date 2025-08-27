import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Demo mode - return default categories
      if (!supabase) {
        const demoCategories = [
          { id: '1', name: 'Food & Dining', description: 'Restaurant and food purchases' },
          { id: '2', name: 'Transport', description: 'Matatu, taxi, and travel expenses' },
          { id: '3', name: 'Shopping', description: 'General shopping and retail' },
          { id: '4', name: 'Bills & Utilities', description: 'Electricity, water, internet' },
          { id: '5', name: 'Entertainment', description: 'Movies, games, subscriptions' },
          { id: '6', name: 'Health', description: 'Medical expenses and healthcare' },
          { id: '7', name: 'Education', description: 'School fees and learning materials' },
          { id: '8', name: 'Other', description: 'Miscellaneous expenses' }
        ];
        return res.status(200).json(demoCategories);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;

      res.status(200).json(categories || []);
    } catch (error) {
      console.error('Categories fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  } else if (req.method === 'POST') {
    try {
      if (!supabase) {
        return res.status(500).json({ message: 'Database not configured' });
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { name, description } = req.body;

      const { data: category, error } = await supabase
        .from('categories')
        .insert({
          name,
          description,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json(category);
    } catch (error) {
      console.error('Category creation error:', error);
      res.status(500).json({ message: 'Failed to create category' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ message: 'Method not allowed' });
  }
}
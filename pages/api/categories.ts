
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Supabase configuration check:');
  console.log('- URL configured:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('- Key configured:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Supabase configuration missing' });
  }

  try {
    console.log('✅ Supabase client initialized successfully');

    if (req.method === 'GET') {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Categories fetch error:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(categories || []);
    }

    if (req.method === 'POST') {
      const { name, color, is_personal } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Category name is required' });
      }

      const { data: category, error } = await supabase
        .from('categories')
        .insert([{
          name,
          color: color || '#3B82F6',
          is_personal: is_personal || false
        }])
        .select()
        .single();

      if (error) {
        console.error('Category creation error:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json(category);
    }

    // Method not allowed
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

// Get user from auth token
async function getAuthenticatedUser(req: NextApiRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ') || !supabase) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  return error || !user ? null : user;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!supabase) {
    return res.status(500).json({ message: 'Database not configured' });
  }

  if (req.method === 'GET') {
    try {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .eq('userId', user.id)
        .order('createdAt', { ascending: true });

      if (error) throw error;

      // Create default categories if none exist
      if (!categories || categories.length === 0) {
        const defaultCategories = [
          // Hotel Operations - Expenses
          { name: "Food & Beverages", color: "#EF4444", type: "expense", userId: user.id },
          { name: "Kitchen Supplies", color: "#F97316", type: "expense", userId: user.id },
          { name: "Housekeeping", color: "#EAB308", type: "expense", userId: user.id },
          { name: "Maintenance & Repairs", color: "#8B5CF6", type: "expense", userId: user.id },
          { name: "Utilities & Bills", color: "#3B82F6", type: "expense", userId: user.id },
          { name: "Staff Wages", color: "#10B981", type: "expense", userId: user.id },
          { name: "Linens & Towels", color: "#06B6D4", type: "expense", userId: user.id },
          { name: "Guest Amenities", color: "#F59E0B", type: "expense", userId: user.id },
          { name: "Marketing & Events", color: "#EC4899", type: "expense", userId: user.id },
          { name: "Equipment & Furniture", color: "#6366F1", type: "expense", userId: user.id },
          { name: "Security & Safety", color: "#84CC16", type: "expense", userId: user.id },
          { name: "Transportation", color: "#F59E0B", type: "expense", userId: user.id },
          { name: "Professional Services", color: "#14B8A6", type: "expense", userId: user.id },
          { name: "Personal Expenses", color: "#F97316", type: "expense", userId: user.id },

          // Hotel Revenue - Income
          { name: "Room Revenue", color: "#22C55E", type: "income", userId: user.id },
          { name: "Restaurant Revenue", color: "#8B5CF6", type: "income", userId: user.id },
          { name: "Event Bookings", color: "#3B82F6", type: "income", userId: user.id },
          { name: "Other Services", color: "#10B981", type: "income", userId: user.id },
        ];

        const { data: newCategories, error: insertError } = await supabase
          .from('categories')
          .insert(defaultCategories)
          .select();

        if (insertError) throw insertError;
        return res.json(newCategories);
      }

      res.json(categories);
    } catch (error) {
      console.error('Categories fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  } else if (req.method === 'POST') {
    try {
      const categoryData = { ...req.body, userId: user.id };
      
      const { data: category, error } = await supabase
        .from('categories')
        .insert(categoryData)
        .select()
        .single();

      if (error) throw error;
      res.json(category);
    } catch (error) {
      console.error('Category creation error:', error);
      res.status(500).json({ message: 'Failed to create category' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

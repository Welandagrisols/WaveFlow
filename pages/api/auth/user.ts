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
      // Get the authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No authorization token provided' });
      }

      const token = authHeader.substring(7); // Remove "Bearer " prefix

      // Get user from token
      const { data: { user }, error } = await client.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      // Return user data
      return res.status(200).json({
        id: user.id,
        email: user.email,
        firstName: user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.last_name || '',
        emailConfirmed: user.email_confirmed_at !== null,
        createdAt: user.created_at
      });
    } catch (error) {
      console.error('User API error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
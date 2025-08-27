import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

type SupabaseClient = typeof supabase;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = supabase as SupabaseClient;
  if (!client) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  if (req.method === 'POST') {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }

      // Create user account with Supabase Auth
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName || '',
            last_name: lastName || '',
          }
        }
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // Check if user needs to confirm email
      if (data.user && !data.session) {
        // In development/demo mode, we'll auto-confirm or provide alternative flow
        const isEmailConfirmationEnabled = process.env.SUPABASE_EMAIL_CONFIRMATION === 'true';
        
        if (!isEmailConfirmationEnabled) {
          // For demo purposes, treat as successful signup
          return res.status(200).json({ 
            message: 'Account created successfully! You can now sign in.',
            user: data.user,
            needsConfirmation: false
          });
        }
        
        return res.status(200).json({ 
          message: 'Registration successful! Please check your email to confirm your account. If you don\'t receive an email, please contact support.',
          user: data.user,
          needsConfirmation: true
        });
      }

      return res.status(201).json({ 
        message: 'Account created successfully!',
        user: data.user, 
        session: data.session 
      });
    } catch (error) {
      console.error('Signup error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
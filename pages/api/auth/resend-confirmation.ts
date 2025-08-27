
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!supabase) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  if (req.method === 'POST') {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Try to resend confirmation email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        // If resend fails, it might be because email is already confirmed
        // or email service is not configured
        return res.status(200).json({ 
          message: 'If your account exists, you should be able to sign in directly. Email confirmation may not be required.',
          canSignIn: true
        });
      }

      return res.status(200).json({ 
        message: 'Confirmation email sent! Please check your inbox.',
        canSignIn: false
      });
    } catch (error) {
      console.error('Resend confirmation error:', error);
      return res.status(500).json({ 
        error: 'Unable to resend confirmation. You may be able to sign in directly.',
        canSignIn: true
      });
    }
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

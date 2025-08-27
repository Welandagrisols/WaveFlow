import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { access_token, refresh_token, type } = req.query

  if (!access_token || !refresh_token) {
    return res.status(400).json({ error: 'Missing tokens' })
  }

  try {
    // Create server-side Supabase client with direct environment variables
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing')
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Set the session with the tokens from the email link
    const { data, error } = await supabase.auth.setSession({
      access_token: access_token as string,
      refresh_token: refresh_token as string
    })

    if (error) {
      console.error('Auth callback error:', error)
      return res.redirect('/login?error=auth_failed&message=' + encodeURIComponent(error.message))
    }

    if (data.user) {
      console.log('User authenticated successfully:', data.user.email)
      // Redirect to dashboard on successful confirmation
      return res.redirect('/dashboard')
    } else {
      return res.redirect('/login?error=no_user')
    }
  } catch (error) {
    console.error('Callback handling error:', error)
    return res.redirect('/login?error=callback_failed&message=' + encodeURIComponent((error as Error).message))
  }
}
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(501).json({ message: "This API endpoint requires Supabase integration. Please use the Supabase client directly." });
}
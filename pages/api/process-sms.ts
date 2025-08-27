import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Extract shared text from the form data
    const { text, title } = req.body;
    
    // Redirect to the SMS processing page with the shared text
    if (text) {
      const encodedText = encodeURIComponent(text);
      res.redirect(302, `/process-sms?text=${encodedText}`);
    } else {
      res.redirect(302, '/process-sms');
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
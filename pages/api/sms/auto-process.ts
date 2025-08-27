import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

type SupabaseClient = typeof supabase;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = supabase as SupabaseClient;
  if (!client) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  if (req.method === 'POST') {
    try {
      const { smsText, senderNumber, simCard } = req.body;

      if (!smsText) {
        return res.status(400).json({ error: 'SMS text is required' });
      }

      // Simple M-Pesa detection
      const isMpesaSms = smsText.toLowerCase().includes('m-pesa') || 
                        smsText.toLowerCase().includes('mpesa') ||
                        senderNumber?.includes('MPESA');

      if (!isMpesaSms) {
        return res.status(200).json({ 
          processed: false, 
          message: 'Not an M-Pesa SMS' 
        });
      }

      // Extract amount using regex
      const amountMatch = smsText.match(/ksh\s*([\d,\.]+)/i) || 
                         smsText.match(/(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
      
      const parsedAmount = amountMatch ? 
        parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

      // Extract transaction code
      const codeMatch = smsText.match(/([A-Z0-9]{10})/);
      const transactionCode = codeMatch ? codeMatch[1] : 'UNKNOWN';

      // Determine account type based on keywords or SIM
      let accountType = 'business';
      const personalKeywords = ['personal', 'family', 'wife', 'husband', 'child'];
      if (personalKeywords.some(keyword => 
          smsText.toLowerCase().includes(keyword)) || 
          simCard === 'SIM2') {
        accountType = 'personal';
      }

      // Extract recipient name/number
      const recipientMatch = smsText.match(/sent to\s+(\d{10})\s+([^0-9]+)/i) ||
                            smsText.match(/to\s+([^0-9\s]+)/i);
      const recipientName = recipientMatch ? recipientMatch[2]?.trim() : null;

      // Store in SMS transactions table
      const { data: smsRecord, error } = await client
        .from('sms_transactions')
        .insert({
          sms_text: smsText,
          sender_number: senderNumber || 'MPESA',
          sim_card: simCard || 'SIM1',
          account_type: accountType,
          is_processed: false,
          parsed_amount: parsedAmount,
          transaction_code: transactionCode,
          recipient_name: recipientName,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({
        processed: true,
        smsTransaction: smsRecord,
        parsedData: {
          amount: parsedAmount,
          transactionCode,
          recipientName,
          accountType,
          simCard: simCard || 'SIM1'
        },
        message: 'M-Pesa SMS processed and will be included in reports automatically'
      });

    } catch (error) {
      console.error('Auto-process error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
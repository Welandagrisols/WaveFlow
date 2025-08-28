
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

// SMS parsing patterns for M-Pesa
const SMS_PATTERNS = {
  mpesa: /^([A-Z0-9]+)\s+Confirmed\.\s+(?:You have sent|You have received)\s+Ksh([\d,]+\.\d{2})\s+to\s+(.+?)\s+on\s+(\d{1,2}\/\d{1,2}\/\d{2})\s+at\s+(\d{1,2}:\d{2}\s+[AP]M)/i,
  withdrawal: /^([A-Z0-9]+)\s+Confirmed\.\s+You have withdrawn\s+Ksh([\d,]+\.\d{2})\s+from\s+(.+?)\s+on\s+(\d{1,2}\/\d{1,2}\/\d{2})\s+at\s+(\d{1,2}:\d{2}\s+[AP]M)/i
};

function parseSmsMessage(message: string) {
  for (const [type, pattern] of Object.entries(SMS_PATTERNS)) {
    const match = message.match(pattern);
    if (match) {
      const [, transactionId, amount, recipient, date, time] = match;
      return {
        transactionId,
        amount: parseFloat(amount.replace(/,/g, '')),
        recipient: recipient.trim(),
        date,
        time,
        type
      };
    }
  }
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message, phoneNumber } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'SMS message is required' });
    }

    const parsed = parseSmsMessage(message);
    
    if (!parsed) {
      return res.status(400).json({ 
        message: 'Unable to parse SMS message',
        requiresManualEntry: true
      });
    }

    // Save to database
    const { data: transaction, error } = await supabase
      .from('sms_transactions')
      .insert([{
        transaction_id: parsed.transactionId,
        amount: parsed.amount,
        recipient: parsed.recipient,
        date: parsed.date,
        time: parsed.time,
        type: parsed.type,
        phone_number: phoneNumber,
        raw_message: message,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({
      message: 'SMS processed successfully',
      transaction
    });
  } catch (error) {
    console.error('SMS processing error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

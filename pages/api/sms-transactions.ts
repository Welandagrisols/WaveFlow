import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../server/storage';
import { MpesaSmsParser } from '../../server/smsParser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const getUserId = () => {
    // For now, use a default user ID
    return 'demo-user-' + Date.now().toString().slice(-6);
  };

  try {
    if (req.method === 'GET') {
      const userId = getUserId();
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const smsTransactions = await storage.getSmsTransactions(userId, limit, offset);
      res.json(smsTransactions);
    } else if (req.method === 'POST') {
      const userId = getUserId();
      
      // Parse the SMS using the MpesaSmsParser
      const parsedData = MpesaSmsParser.parseSms(req.body.smsText);
      
      // Create SMS transaction record
      const smsTransaction = await storage.createSmsTransaction({
        ...req.body,
        userId,
        parsedAmount: parsedData.amount,
        recipientName: parsedData.recipientName,
        transactionCode: parsedData.transactionCode,
        transactionType: parsedData.transactionType,
        isConfirmed: false
      });

      res.json(smsTransaction);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error("Error in SMS transactions API:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
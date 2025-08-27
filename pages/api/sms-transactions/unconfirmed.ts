import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Return demo unconfirmed SMS transactions
      const demoUnconfirmedSms = [
        {
          id: "1",
          smsText: "QGH7J8K9L0 Confirmed. You have sent Ksh2,500.00 to Local Food Market 0712345678 on 27/8/25 at 2:30 PM. Your M-PESA balance is Ksh45,250.00. Transaction cost Ksh28.00.",
          senderNumber: "MPESA",
          simCard: "SIM1",
          accountType: "business",
          amount: "2500.00",
          recipientPhone: "0712345678",
          recipientName: "Local Food Market",
          transactionCode: "QGH7J8K9L0",
          balance: "45250.00",
          isConfirmed: false,
          createdAt: new Date(Date.now() - 30000).toISOString() // 30 seconds ago
        },
        {
          id: "2",
          smsText: "QGH7J8K9L1 Confirmed. You have sent Ksh800.00 to Cleaning Services 0734567890 on 27/8/25 at 3:15 PM. Your M-PESA balance is Ksh44,450.00. Transaction cost Ksh18.00.",
          senderNumber: "MPESA",
          simCard: "SIM1",
          accountType: "business",
          amount: "800.00",
          recipientPhone: "0734567890",
          recipientName: "Cleaning Services",
          transactionCode: "QGH7J8K9L1",
          balance: "44450.00",
          isConfirmed: false,
          createdAt: new Date(Date.now() - 900000).toISOString() // 15 minutes ago
        }
      ];

      res.json(demoUnconfirmedSms);
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error("Error fetching unconfirmed SMS transactions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
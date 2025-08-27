import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Return demo transactions
      const demoTransactions = [
        {
          id: "1",
          amount: "2500.00",
          currency: "KES",
          direction: "OUT",
          description: "Food supplies purchase",
          payeePhone: "0712345678",
          categoryId: "1",
          transactionType: "MPESA",
          reference: "QGH7J8K9L0",
          isPersonal: false,
          status: "COMPLETED",
          transactionDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: "2",
          amount: "15000.00",
          currency: "KES",
          direction: "IN",
          description: "Room booking payment",
          payeePhone: "0723456789",
          categoryId: "15",
          transactionType: "MPESA",
          reference: "QGH7J8K9L1",
          isPersonal: false,
          status: "COMPLETED",
          transactionDate: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
          createdAt: new Date(Date.now() - 43200000).toISOString()
        },
        {
          id: "3",
          amount: "800.00",
          currency: "KES",
          direction: "OUT",
          description: "Cleaning supplies",
          payeePhone: "0734567890",
          categoryId: "3",
          transactionType: "MPESA",
          reference: "QGH7J8K9L2",
          isPersonal: false,
          status: "COMPLETED",
          transactionDate: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
          createdAt: new Date(Date.now() - 21600000).toISOString()
        }
      ];

      res.json(demoTransactions);
    } else if (req.method === 'POST') {
      // Return demo created transaction
      const newTransaction = {
        id: "demo-" + Date.now(),
        ...req.body,
        createdAt: new Date().toISOString(),
        transactionDate: new Date().toISOString()
      };
      res.json(newTransaction);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error("Error in transactions API:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
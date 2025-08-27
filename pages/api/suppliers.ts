import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Return demo suppliers for hotel/restaurant business
      const demoSuppliers = [
        { id: "1", name: "Local Food Market", phone: "0712345678", category: "Food & Beverages", commonItems: ["Vegetables", "Fruits", "Dairy"] },
        { id: "2", name: "Kitchen Equipment Ltd", phone: "0723456789", category: "Kitchen Supplies", commonItems: ["Cooking utensils", "Appliances", "Cookware"] },
        { id: "3", name: "Cleaning Services Co", phone: "0734567890", category: "Housekeeping", commonItems: ["Detergents", "Cleaning equipment", "Supplies"] },
        { id: "4", name: "Maintenance Solutions", phone: "0745678901", category: "Maintenance & Repairs", commonItems: ["Tools", "Parts", "Services"] },
        { id: "5", name: "Staff Catering", phone: "0756789012", category: "Staff Meals", commonItems: ["Lunch", "Beverages", "Snacks"] },
        { id: "6", name: "Linen Supply Co", phone: "0767890123", category: "Linens & Towels", commonItems: ["Bed sheets", "Towels", "Uniforms"] }
      ];

      res.json(demoSuppliers);
    } else if (req.method === 'POST') {
      // Return demo created supplier
      const newSupplier = {
        id: "demo-" + Date.now(),
        ...req.body,
        createdAt: new Date().toISOString()
      };
      res.json(newSupplier);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error("Error in suppliers API:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
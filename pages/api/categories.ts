import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Return demo categories for hotel/restaurant business
      const demoCategories = [
        // Hotel Operations - Expenses
        { id: "1", name: "Food & Beverages", color: "#EF4444", type: "expense", isBusiness: true },
        { id: "2", name: "Kitchen Supplies", color: "#F97316", type: "expense", isBusiness: true },
        { id: "3", name: "Housekeeping", color: "#EAB308", type: "expense", isBusiness: true },
        { id: "4", name: "Maintenance & Repairs", color: "#8B5CF6", type: "expense", isBusiness: true },
        { id: "5", name: "Utilities & Bills", color: "#3B82F6", type: "expense", isBusiness: true },
        { id: "6", name: "Staff Wages", color: "#10B981", type: "expense", isBusiness: true },
        { id: "7", name: "Linens & Towels", color: "#06B6D4", type: "expense", isBusiness: true },
        { id: "8", name: "Guest Amenities", color: "#F59E0B", type: "expense", isBusiness: true },
        { id: "9", name: "Marketing & Events", color: "#EC4899", type: "expense", isBusiness: true },
        { id: "10", name: "Equipment & Furniture", color: "#6366F1", type: "expense", isBusiness: true },
        { id: "11", name: "Security & Safety", color: "#84CC16", type: "expense", isBusiness: true },
        { id: "12", name: "Transportation", color: "#F59E0B", type: "expense", isBusiness: true },
        { id: "13", name: "Professional Services", color: "#14B8A6", type: "expense", isBusiness: true },
        { id: "14", name: "Personal Expenses", color: "#F97316", type: "expense", isBusiness: false },

        // Hotel Revenue - Income
        { id: "15", name: "Room Revenue", color: "#22C55E", type: "income", isBusiness: true },
        { id: "16", name: "Restaurant Revenue", color: "#8B5CF6", type: "income", isBusiness: true },
        { id: "17", name: "Event Bookings", color: "#3B82F6", type: "income", isBusiness: true },
        { id: "18", name: "Other Services", color: "#10B981", type: "income", isBusiness: true },
      ];

      res.json(demoCategories);
    } else if (req.method === 'POST') {
      // Return demo created category
      const newCategory = {
        id: "demo-" + Date.now(),
        ...req.body,
        createdAt: new Date().toISOString()
      };
      res.json(newCategory);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error("Error in categories API:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
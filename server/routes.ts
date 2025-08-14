import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTransactionSchema, insertCategorySchema, insertPaymentReminderSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Categories routes
  app.get("/api/categories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const categories = await storage.getCategories(userId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory({ ...categoryData, userId });
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Transactions routes
  app.get("/api/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const transactions = await storage.getTransactions(userId, limit, offset);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction({ ...transactionData, userId });
      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.get("/api/transactions/summary", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const summary = await storage.getTransactionsSummary(userId, startDate, endDate);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching transaction summary:", error);
      res.status(500).json({ message: "Failed to fetch transaction summary" });
    }
  });

  app.get("/api/transactions/by-category", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const categories = await storage.getTransactionsByCategory(userId, startDate, endDate);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching transactions by category:", error);
      res.status(500).json({ message: "Failed to fetch transactions by category" });
    }
  });

  // Payment reminders routes
  app.get("/api/payment-reminders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reminders = await storage.getPaymentReminders(userId);
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching payment reminders:", error);
      res.status(500).json({ message: "Failed to fetch payment reminders" });
    }
  });

  app.post("/api/payment-reminders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reminderData = insertPaymentReminderSchema.parse(req.body);
      const reminder = await storage.createPaymentReminder({ ...reminderData, userId });
      res.json(reminder);
    } catch (error) {
      console.error("Error creating payment reminder:", error);
      res.status(500).json({ message: "Failed to create payment reminder" });
    }
  });

  app.patch("/api/payment-reminders/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const { status } = req.body;
      const reminder = await storage.updatePaymentReminderStatus(id, userId, status);
      if (!reminder) {
        return res.status(404).json({ message: "Payment reminder not found" });
      }
      res.json(reminder);
    } catch (error) {
      console.error("Error updating payment reminder:", error);
      res.status(500).json({ message: "Failed to update payment reminder" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTransactionSchema, insertCategorySchema, insertPaymentReminderSchema, insertSmsTransactionSchema, insertSupplierSchema, insertItemSchema } from "@shared/schema";
import { MpesaSmsParser } from "./smsParser";

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
      let categories = await storage.getCategories(userId);
      
      // If no categories exist, create default ones
      if (categories.length === 0) {
        const defaultCategories = [
          { name: "Food & Dining", color: "#EF4444", type: "expense" as const },
          { name: "Transportation", color: "#F97316", type: "expense" as const },
          { name: "Shopping", color: "#EAB308", type: "expense" as const },
          { name: "Entertainment", color: "#8B5CF6", type: "expense" as const },
          { name: "Bills & Utilities", color: "#3B82F6", type: "expense" as const },
          { name: "Healthcare", color: "#10B981", type: "expense" as const },
          { name: "Education", color: "#06B6D4", type: "expense" as const },
          { name: "Personal Care", color: "#F59E0B", type: "expense" as const },
          { name: "Salary", color: "#22C55E", type: "income" as const },
          { name: "Business", color: "#8B5CF6", type: "income" as const },
          { name: "Investments", color: "#3B82F6", type: "income" as const },
          { name: "Other Income", color: "#10B981", type: "income" as const },
        ];

        for (const categoryData of defaultCategories) {
          await storage.createCategory({ ...categoryData, userId });
        }
        
        // Fetch the newly created categories
        categories = await storage.getCategories(userId);
      }
      
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

  // SMS Transaction routes
  app.post("/api/sms-transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { smsText, senderNumber, simCard } = req.body;
      
      // Parse the SMS
      const parsedTransaction = MpesaSmsParser.parseSms(smsText);
      
      if (!parsedTransaction.isValid) {
        return res.status(400).json({ message: "Unable to parse SMS transaction" });
      }
      
      // Determine SIM and account type
      const detectedSimCard = simCard || MpesaSmsParser.detectSimCard(senderNumber, smsText);
      const accountType = MpesaSmsParser.classifyAccountType(parsedTransaction.recipientName, parsedTransaction.amount);
      
      // Create SMS transaction record
      const smsTransaction = await storage.createSmsTransaction({
        smsText,
        senderNumber: senderNumber || 'M-PESA',
        simCard: detectedSimCard,
        accountType,
        amount: parsedTransaction.amount.toString(),
        recipientPhone: parsedTransaction.recipientPhone,
        recipientName: parsedTransaction.recipientName,
        transactionCode: parsedTransaction.transactionCode,
        balance: parsedTransaction.balance?.toString(),
        isConfirmed: false,
        userId
      });
      
      // Check if we know this supplier
      let supplier = null;
      if (parsedTransaction.recipientPhone) {
        supplier = await storage.getSupplierByPhone(userId, parsedTransaction.recipientPhone);
      }
      
      res.json({
        smsTransaction,
        parsedData: parsedTransaction,
        supplier,
        needsConfirmation: true
      });
    } catch (error) {
      console.error("Error processing SMS transaction:", error);
      res.status(500).json({ message: "Failed to process SMS transaction" });
    }
  });

  app.get("/api/sms-transactions/unconfirmed", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const unconfirmedTransactions = await storage.getUnconfirmedSmsTransactions(userId);
      res.json(unconfirmedTransactions);
    } catch (error) {
      console.error("Error fetching unconfirmed SMS transactions:", error);
      res.status(500).json({ message: "Failed to fetch unconfirmed transactions" });
    }
  });

  app.patch("/api/sms-transactions/:id/confirm", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const { itemName, supplierName, categoryId, isPersonal } = req.body;
      
      // Get the SMS transaction
      const smsTransactions = await storage.getUnconfirmedSmsTransactions(userId);
      const smsTransaction = smsTransactions.find(t => t.id === id);
      
      if (!smsTransaction) {
        return res.status(404).json({ message: "SMS transaction not found" });
      }
      
      // Create the actual transaction
      const transaction = await storage.createTransaction({
        amount: smsTransaction.amount,
        currency: "KES",
        direction: "OUT",
        description: itemName || `Payment to ${supplierName || smsTransaction.recipientName || 'Unknown'}`,
        payeePhone: smsTransaction.recipientPhone,
        categoryId,
        transactionType: "MPESA",
        reference: smsTransaction.transactionCode,
        notes: `Processed from SMS: ${smsTransaction.smsText.substring(0, 100)}...`,
        isPersonal: isPersonal || false,
        status: "COMPLETED",
        transactionDate: smsTransaction.createdAt,
        userId
      });
      
      // Confirm SMS transaction
      await storage.confirmSmsTransaction(id, userId, itemName, supplierName, categoryId);
      
      // Update or create supplier
      if (smsTransaction.recipientPhone && supplierName) {
        let supplier = await storage.getSupplierByPhone(userId, smsTransaction.recipientPhone);
        if (!supplier) {
          supplier = await storage.createSupplier({
            name: supplierName,
            phone: smsTransaction.recipientPhone,
            commonItems: itemName ? [itemName] : [],
            defaultCategoryId: categoryId,
            isPersonal: isPersonal || false,
            totalTransactions: "1",
            lastTransactionDate: new Date(),
            userId
          });
        } else if (itemName) {
          await storage.updateSupplierItems(supplier.id, userId, itemName);
        }
      }
      
      // Update or create item
      if (itemName) {
        let item = await storage.getItemByName(userId, itemName);
        if (!item) {
          await storage.createItem({
            name: itemName,
            categoryId,
            avgPrice: smsTransaction.amount,
            lastPrice: smsTransaction.amount,
            unit: "piece",
            purchaseCount: "1",
            isPersonal: isPersonal || false,
            userId
          });
        } else {
          await storage.updateItemPrice(item.id, userId, Number(smsTransaction.amount));
        }
      }
      
      res.json({ transaction, confirmed: true });
    } catch (error) {
      console.error("Error confirming SMS transaction:", error);
      res.status(500).json({ message: "Failed to confirm transaction" });
    }
  });

  // Suppliers routes
  app.get("/api/suppliers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const suppliers = await storage.getSuppliers(userId);
      res.json(suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  // Items routes
  app.get("/api/items", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { categoryId } = req.query;
      const items = await storage.getItems(userId, categoryId as string);
      res.json(items);
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

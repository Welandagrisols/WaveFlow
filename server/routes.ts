import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertCategorySchema, insertPaymentReminderSchema, insertSmsTransactionSchema, insertSupplierSchema, insertItemSchema } from "../shared/schema";
import { MpesaSmsParser } from "./smsParser";
import { wsManager } from "./websocket";

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple middleware to extract user ID (for demo purposes)
  const getUserId = (req: any) => {
    // For now, use a default user ID
    return 'demo-user-' + Date.now().toString().slice(-6);
  };

  // Auth routes (simplified)
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      const userId = getUserId(req);
      // Return a demo user for now
      const user = {
        id: userId,
        email: 'demo@yasinga.com',
        firstName: 'Demo',
        lastName: 'User',
        businessName: 'My Business'
      };
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req: any, res) => {
    try {
      const userId = getUserId(req);
      let categories = await storage.getCategories(userId);

      // If no categories exist, create default ones
      if (categories.length === 0) {
        const defaultCategories = [
          // Hotel Operations - Expenses
          { name: "Food & Beverages", color: "#EF4444", type: "expense" as const },
          { name: "Kitchen Supplies", color: "#F97316", type: "expense" as const },
          { name: "Housekeeping", color: "#EAB308", type: "expense" as const },
          { name: "Maintenance & Repairs", color: "#8B5CF6", type: "expense" as const },
          { name: "Utilities & Bills", color: "#3B82F6", type: "expense" as const },
          { name: "Staff Wages", color: "#10B981", type: "expense" as const },
          { name: "Linens & Towels", color: "#06B6D4", type: "expense" as const },
          { name: "Guest Amenities", color: "#F59E0B", type: "expense" as const },
          { name: "Marketing & Events", color: "#EC4899", type: "expense" as const },
          { name: "Equipment & Furniture", color: "#6366F1", type: "expense" as const },
          { name: "Security & Safety", color: "#84CC16", type: "expense" as const },
          { name: "Transportation", color: "#F59E0B", type: "expense" as const },
          { name: "Professional Services", color: "#14B8A6", type: "expense" as const },
          { name: "Personal Expenses", color: "#F97316", type: "expense" as const },

          // Hotel Revenue - Income
          { name: "Room Revenue", color: "#22C55E", type: "income" as const },
          { name: "Restaurant Revenue", color: "#8B5CF6", type: "income" as const },
          { name: "Event Bookings", color: "#3B82F6", type: "income" as const },
          { name: "Other Services", color: "#10B981", type: "income" as const },
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

  app.post("/api/categories", async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory({ ...categoryData, userId });

      // Broadcast real-time update to all user's devices
      wsManager.broadcastCategoryUpdate(userId, category);

      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Transactions routes
  app.get("/api/transactions", async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const transactions = await storage.getTransactions(userId, limit, offset);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction({ ...transactionData, userId });

      // Broadcast real-time update to all user's devices
      wsManager.broadcastTransactionUpdate(userId, transaction);

      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.get("/api/transactions/summary", async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const summary = await storage.getTransactionsSummary(userId, startDate, endDate);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching transaction summary:", error);
      res.status(500).json({ message: "Failed to fetch transaction summary" });
    }
  });

  app.get("/api/transactions/by-category", async (req: any, res) => {
    try {
      const userId = getUserId(req);
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
  app.get("/api/payment-reminders", async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const reminders = await storage.getPaymentReminders(userId);
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching payment reminders:", error);
      res.status(500).json({ message: "Failed to fetch payment reminders" });
    }
  });

  app.post("/api/payment-reminders", async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const reminderData = insertPaymentReminderSchema.parse(req.body);
      const reminder = await storage.createPaymentReminder({ ...reminderData, userId });
      res.json(reminder);
    } catch (error) {
      console.error("Error creating payment reminder:", error);
      res.status(500).json({ message: "Failed to create payment reminder" });
    }
  });

  app.patch("/api/payment-reminders/:id/status", async (req: any, res) => {
    try {
      const userId = getUserId(req);
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
  app.post("/api/sms-transactions", async (req: any, res) => {
    try {
      const userId = getUserId(req);
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
        smsTransaction: {
          ...smsTransaction,
          suggestedPurpose: parsedTransaction.suggestedPurpose,
          suggestedCategory: parsedTransaction.suggestedCategory
        },
        parsedData: parsedTransaction,
        supplier,
        needsConfirmation: true
      });
    } catch (error) {
      console.error("Error processing SMS transaction:", error);
      res.status(500).json({ message: "Failed to process SMS transaction" });
    }
  });

  app.get("/api/sms-transactions/unconfirmed", async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const unconfirmedTransactions = await storage.getUnconfirmedSmsTransactions(userId);
      res.json(unconfirmedTransactions);
    } catch (error) {
      console.error("Error fetching unconfirmed SMS transactions:", error);
      res.status(500).json({ message: "Failed to fetch unconfirmed transactions" });
    }
  });

  app.patch("/api/sms-transactions/:id/confirm", async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const { itemName, supplierName, categoryId, isPersonal, isLoan, loanRecipient, expectedRepaymentDate } = req.body;

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
        isLoan: isLoan || false,
        loanRecipient: (isLoan && loanRecipient) ? loanRecipient : undefined,
        expectedRepaymentDate: (isLoan && expectedRepaymentDate) ? new Date(expectedRepaymentDate) : undefined,
        isRepaid: false,
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
  app.get("/api/suppliers", async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const suppliers = await storage.getSuppliers(userId);
      res.json(suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  // Items routes
  app.get("/api/items", async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { categoryId } = req.query;
      const items = await storage.getItems(userId, categoryId as string);
      res.json(items);
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  // Analytics endpoint for supplier spending
  app.get("/api/analytics/suppliers", async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { startDate, endDate } = req.query;

      const transactions = await storage.getTransactions(userId, 1000, 0);
      const suppliers = await storage.getSuppliers(userId);

      const supplierAnalytics = suppliers.map((supplier: any) => {
        const supplierTransactions = transactions.filter((t: any) => 
          t.payeePhone === supplier.phone &&
          (!startDate || new Date(t.transactionDate) >= new Date(startDate as string)) &&
          (!endDate || new Date(t.transactionDate) <= new Date(endDate as string))
        );

        const totalAmount = supplierTransactions.reduce((sum, t: any) => sum + parseFloat(t.amount), 0);
        const avgAmount = supplierTransactions.length > 0 ? totalAmount / supplierTransactions.length : 0;
        const lastTransaction = supplierTransactions.length > 0 ? 
          Math.max(...supplierTransactions.map((t: any) => new Date(t.transactionDate).getTime())) : 0;

        return {
          ...supplier,
          totalSpent: totalAmount,
          transactionCount: supplierTransactions.length,
          avgTransactionAmount: avgAmount,
          lastTransactionDate: lastTransaction > 0 ? new Date(lastTransaction) : null,
          businessTransactions: supplierTransactions.filter((t: any) => !t.isPersonal).length,
          personalTransactions: supplierTransactions.filter((t: any) => t.isPersonal).length
        };
      }).filter((s: any) => s.totalSpent > 0)
        .sort((a: any, b: any) => b.totalSpent - a.totalSpent);

      res.json(supplierAnalytics);
    } catch (error) {
      console.error("Error fetching supplier analytics:", error);
      res.status(500).json({ message: "Failed to fetch supplier analytics" });
    }
  });

  // Analytics endpoint for item spending
  app.get("/api/analytics/items", async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { startDate, endDate, categoryId } = req.query;

      const transactions = await storage.getTransactions(userId, 1000, 0);
      const items = await storage.getItems(userId, categoryId as string);

      const itemAnalytics = items.map((item: any) => {
        const itemTransactions = transactions.filter((t: any) => 
          t.description?.toLowerCase().includes(item.name.toLowerCase()) &&
          (!startDate || new Date(t.transactionDate) >= new Date(startDate as string)) &&
          (!endDate || new Date(t.transactionDate) <= new Date(endDate as string))
        );

        const totalAmount = itemTransactions.reduce((sum, t: any) => sum + parseFloat(t.amount), 0);
        const avgAmount = itemTransactions.length > 0 ? totalAmount / itemTransactions.length : 0;
        const lastPrice = itemTransactions.length > 0 ? 
          parseFloat(itemTransactions.sort((a: any, b: any) => 
            new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
          )[0].amount) : 0;

        return {
          ...item,
          totalSpent: totalAmount,
          transactionCount: itemTransactions.length,
          avgPrice: avgAmount,
          lastPrice,
          businessTransactions: itemTransactions.filter((t: any) => !t.isPersonal).length,
          personalTransactions: itemTransactions.filter((t: any) => t.isPersonal).length
        };
      }).filter((i: any) => i.totalSpent > 0)
        .sort((a: any, b: any) => b.totalSpent - a.totalSpent);

      res.json(itemAnalytics);
    } catch (error) {
      console.error("Error fetching item analytics:", error);
      res.status(500).json({ message: "Failed to fetch item analytics" });
    }
  });

  // Loan tracking routes
  app.get("/api/loans/outstanding", async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const outstandingLoans = await storage.getOutstandingLoans(userId);
      res.json(outstandingLoans);
    } catch (error) {
      console.error("Error fetching outstanding loans:", error);
      res.status(500).json({ message: "Failed to fetch outstanding loans" });
    }
  });

  app.patch("/api/loans/:transactionId/repaid", async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { transactionId } = req.params;
      await storage.markLoanAsRepaid(transactionId, userId);
      res.json({ message: "Loan marked as repaid successfully" });
    } catch (error) {
      console.error("Error marking loan as repaid:", error);
      res.status(500).json({ message: "Failed to mark loan as repaid" });
    }
  });

  // Personal expenses summary route
  app.get("/api/personal-expenses/summary", async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { startDate, endDate } = req.query;
      const summary = await storage.getPersonalExpensesSummary(
        userId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json(summary);
    } catch (error) {
      console.error("Error fetching personal expenses summary:", error);
      res.status(500).json({ message: "Failed to fetch personal expenses summary" });
    }
  });

  // Initialize personal categories for new users
  app.post("/api/categories/init-personal", async (req: any, res) => {
    try {
      const userId = getUserId(req);
      await storage.initializePersonalCategories(userId);
      res.json({ message: "Personal categories initialized successfully" });
    } catch (error) {
      console.error("Error initializing personal categories:", error);
      res.status(500).json({ message: "Failed to initialize personal categories" });
    }
  });

  // Data export routes
  app.get("/api/export/json", async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { startDate, endDate } = req.query;

      const [transactions, categories, suppliers, paymentReminders] = await Promise.all([
        storage.getTransactions(userId, 10000, 0),
        storage.getCategories(userId),
        storage.getSuppliers(userId),
        storage.getPaymentReminders(userId)
      ]);

      const filteredTransactions = transactions.filter((t: any) => {
        const transactionDate = new Date(t.transactionDate);
        return (!startDate || transactionDate >= new Date(startDate as string)) &&
               (!endDate || transactionDate <= new Date(endDate as string));
      });

      const exportData = {
        exportDate: new Date().toISOString(),
        dateRange: {
          startDate: startDate || null,
          endDate: endDate || null
        },
        transactions: filteredTransactions,
        categories,
        suppliers,
        paymentReminders,
        summary: {
          totalTransactions: filteredTransactions.length,
          totalIncome: filteredTransactions.filter((t: any) => t.direction === 'IN').reduce((sum, t: any) => sum + parseFloat(t.amount), 0),
          totalExpenses: filteredTransactions.filter((t: any) => t.direction === 'OUT').reduce((sum, t: any) => sum + parseFloat(t.amount), 0)
        }
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="yasinga-export-${new Date().toISOString().split('T')[0]}.json"`);
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting JSON data:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  app.get("/api/export/csv", async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { startDate, endDate } = req.query;
      const Papa = (await import('papaparse')).default;

      const [transactions, categories] = await Promise.all([
        storage.getTransactions(userId, 10000, 0),
        storage.getCategories(userId)
      ]);

      const categoryMap = new Map(categories.map((c: any) => [c.id, c.name]));

      const filteredTransactions = transactions.filter((t: any) => {
        const transactionDate = new Date(t.transactionDate);
        return (!startDate || transactionDate >= new Date(startDate as string)) &&
               (!endDate || transactionDate <= new Date(endDate as string));
      });

      const csvData = filteredTransactions.map((t: any) => ({
        Date: new Date(t.transactionDate).toLocaleDateString(),
        Amount: t.amount,
        Currency: t.currency,
        Direction: t.direction,
        Description: t.description,
        Category: categoryMap.get(t.categoryId) || 'Uncategorized',
        PayeePhone: t.payeePhone || '',
        TransactionType: t.transactionType,
        Reference: t.reference || '',
        IsPersonal: t.isPersonal ? 'Yes' : 'No',
        IsLoan: t.isLoan ? 'Yes' : 'No',
        Status: t.status
      }));

      const csv = Papa.unparse(csvData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="yasinga-transactions-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    } catch (error) {
      console.error("Error exporting CSV data:", error);
      res.status(500).json({ message: "Failed to export CSV data" });
    }
  });

  app.get("/api/export/pdf", async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { startDate, endDate } = req.query;
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;

      const [transactions, categories, user] = await Promise.all([
        storage.getTransactions(userId, 10000, 0),
        storage.getCategories(userId),
        storage.getUser(userId)
      ]);

      const categoryMap = new Map(categories.map((c: any) => [c.id, c.name]));

      const filteredTransactions = transactions.filter((t: any) => {
        const transactionDate = new Date(t.transactionDate);
        return (!startDate || transactionDate >= new Date(startDate as string)) &&
               (!endDate || transactionDate <= new Date(endDate as string));
      });

      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.text('Yasinga Financial Report', 20, 30);
      doc.setFontSize(12);
      doc.text(`Generated for: ${user?.firstName || 'User'} ${user?.lastName || ''}`, 20, 45);
      doc.text(`Export Date: ${new Date().toLocaleDateString()}`, 20, 55);

      if (startDate || endDate) {
        doc.text(`Period: ${startDate ? new Date(startDate as string).toLocaleDateString() : 'Beginning'} - ${endDate ? new Date(endDate as string).toLocaleDateString() : 'Present'}`, 20, 65);
      }

      // Summary
      const totalIncome = filteredTransactions.filter((t: any) => t.direction === 'IN').reduce((sum, t: any) => sum + parseFloat(t.amount), 0);
      const totalExpenses = filteredTransactions.filter((t: any) => t.direction === 'OUT').reduce((sum, t: any) => sum + parseFloat(t.amount), 0);
      const netBalance = totalIncome - totalExpenses;

      doc.setFontSize(14);
      doc.text('Summary', 20, 85);
      doc.setFontSize(11);
      doc.text(`Total Income: KES ${totalIncome.toLocaleString()}`, 20, 100);
      doc.text(`Total Expenses: KES ${totalExpenses.toLocaleString()}`, 20, 110);
      doc.text(`Net Balance: KES ${netBalance.toLocaleString()}`, 20, 120);
      doc.text(`Total Transactions: ${filteredTransactions.length}`, 20, 130);

      // Transactions table
      const tableData = filteredTransactions.slice(0, 100).map((t: any) => [
        new Date(t.transactionDate).toLocaleDateString(),
        t.direction === 'IN' ? `+${t.amount}` : `-${t.amount}`,
        t.description.substring(0, 30),
        categoryMap.get(t.categoryId) || 'Uncategorized',
        t.transactionType
      ]);

      autoTable(doc, {
        head: [['Date', 'Amount (KES)', 'Description', 'Category', 'Type']],
        body: tableData,
        startY: 145,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 102, 204] }
      });

      if (filteredTransactions.length > 100) {
        doc.text(`Note: Showing first 100 of ${filteredTransactions.length} transactions`, 20, (doc as any).lastAutoTable?.finalY + 10 || 200);
      }

      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="yasinga-report-${new Date().toISOString().split('T')[0]}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error exporting PDF data:", error);
      res.status(500).json({ message: "Failed to export PDF data" });
    }
  });

  // Backup functionality
  app.post("/api/backup/email", async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email address is required" });
      }

      // Get all user data for backup
      const [transactions, categories, suppliers, paymentReminders, user] = await Promise.all([
        storage.getTransactions(userId, 10000, 0),
        storage.getCategories(userId),
        storage.getSuppliers(userId),
        storage.getPaymentReminders(userId),
        storage.getUser(userId)
      ]);

      const backupData = {
        backupDate: new Date().toISOString(),
        userId,
        userInfo: user,
        transactions,
        categories,
        suppliers,
        paymentReminders,
        metadata: {
          totalTransactions: transactions.length,
          totalCategories: categories.length,
          totalSuppliers: suppliers.length
        }
      };

      // For now, return the backup data (email sending would need SMTP configuration)
      res.json({
        message: "Backup created successfully",
        backupData,
        note: "Email sending requires SMTP configuration. Backup data returned for download."
      });
    } catch (error) {
      console.error("Error creating backup:", error);
      res.status(500).json({ message: "Failed to create backup" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
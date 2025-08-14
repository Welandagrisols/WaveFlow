import {
  users,
  categories,
  transactions,
  paymentReminders,
  smsTransactions,
  suppliers,
  items,
  type User,
  type UpsertUser,
  type Transaction,
  type InsertTransaction,
  type Category,
  type InsertCategory,
  type PaymentReminder,
  type InsertPaymentReminder,
  type SmsTransaction,
  type InsertSmsTransaction,
  type Supplier,
  type InsertSupplier,
  type Item,
  type InsertItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Category operations
  getCategories(userId: string): Promise<Category[]>;
  createCategory(category: InsertCategory & { userId: string }): Promise<Category>;
  
  // Transaction operations
  getTransactions(userId: string, limit?: number, offset?: number): Promise<Transaction[]>;
  getTransactionById(id: string, userId: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction & { userId: string }): Promise<Transaction>;
  getTransactionsSummary(userId: string, startDate?: Date, endDate?: Date): Promise<{
    totalIncome: number;
    totalExpenses: number;
    transactionCount: number;
  }>;
  getTransactionsByCategory(userId: string, startDate?: Date, endDate?: Date): Promise<Array<{
    categoryName: string;
    amount: number;
    count: number;
  }>>;
  
  // Payment reminder operations
  getPaymentReminders(userId: string): Promise<PaymentReminder[]>;
  createPaymentReminder(reminder: InsertPaymentReminder & { userId: string }): Promise<PaymentReminder>;
  updatePaymentReminderStatus(id: string, userId: string, status: string): Promise<PaymentReminder | undefined>;
  
  // SMS Transaction operations
  createSmsTransaction(smsTransaction: InsertSmsTransaction & { userId: string }): Promise<SmsTransaction>;
  getUnconfirmedSmsTransactions(userId: string): Promise<SmsTransaction[]>;
  confirmSmsTransaction(id: string, userId: string, itemName?: string, supplierName?: string, categoryId?: string): Promise<SmsTransaction | undefined>;
  
  // Supplier operations
  getSuppliers(userId: string): Promise<Supplier[]>;
  getSupplierByPhone(userId: string, phone: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier & { userId: string }): Promise<Supplier>;
  updateSupplierItems(supplierId: string, userId: string, newItem: string): Promise<void>;
  
  // Item operations
  getItems(userId: string, categoryId?: string): Promise<Item[]>;
  getItemByName(userId: string, name: string): Promise<Item | undefined>;
  createItem(item: InsertItem & { userId: string }): Promise<Item>;
  updateItemPrice(itemId: string, userId: string, price: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getCategories(userId: string): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(categories.name);
  }

  async createCategory(category: InsertCategory & { userId: string }): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  async getTransactions(userId: string, limit = 50, offset = 0): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.transactionDate))
      .limit(limit)
      .offset(offset);
  }

  async getTransactionById(id: string, userId: string): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
    return transaction;
  }

  async createTransaction(transaction: InsertTransaction & { userId: string }): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getTransactionsSummary(userId: string, startDate?: Date, endDate?: Date) {
    const conditions = [eq(transactions.userId, userId)];
    
    if (startDate) {
      conditions.push(gte(transactions.transactionDate, startDate));
    }
    if (endDate) {
      conditions.push(lte(transactions.transactionDate, endDate));
    }

    const result = await db
      .select({
        direction: transactions.direction,
        total: sql<number>`sum(${transactions.amount})`,
        count: sql<number>`count(*)`,
      })
      .from(transactions)
      .where(and(...conditions))
      .groupBy(transactions.direction);

    const income = result.find(r => r.direction === 'IN')?.total || 0;
    const expenses = result.find(r => r.direction === 'OUT')?.total || 0;
    const totalCount = result.reduce((sum, r) => sum + r.count, 0);

    return {
      totalIncome: Number(income),
      totalExpenses: Number(expenses),
      transactionCount: totalCount,
    };
  }

  async getTransactionsByCategory(userId: string, startDate?: Date, endDate?: Date) {
    const conditions = [eq(transactions.userId, userId)];
    
    if (startDate) {
      conditions.push(gte(transactions.transactionDate, startDate));
    }
    if (endDate) {
      conditions.push(lte(transactions.transactionDate, endDate));
    }

    const result = await db
      .select({
        categoryName: sql<string>`coalesce(${categories.name}, 'Uncategorized')`,
        amount: sql<number>`sum(${transactions.amount})`,
        count: sql<number>`count(*)`,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(...conditions))
      .groupBy(categories.name);

    return result.map(r => ({
      categoryName: r.categoryName,
      amount: Number(r.amount),
      count: r.count,
    }));
  }

  async getPaymentReminders(userId: string): Promise<PaymentReminder[]> {
    return await db
      .select()
      .from(paymentReminders)
      .where(eq(paymentReminders.userId, userId))
      .orderBy(paymentReminders.dueDate);
  }

  async createPaymentReminder(reminder: InsertPaymentReminder & { userId: string }): Promise<PaymentReminder> {
    const [newReminder] = await db
      .insert(paymentReminders)
      .values(reminder)
      .returning();
    return newReminder;
  }

  async updatePaymentReminderStatus(id: string, userId: string, status: string): Promise<PaymentReminder | undefined> {
    const [updatedReminder] = await db
      .update(paymentReminders)
      .set({ status })
      .where(and(eq(paymentReminders.id, id), eq(paymentReminders.userId, userId)))
      .returning();
    return updatedReminder;
  }

  // SMS Transaction operations
  async createSmsTransaction(smsTransaction: InsertSmsTransaction & { userId: string }): Promise<SmsTransaction> {
    const [newSmsTransaction] = await db
      .insert(smsTransactions)
      .values(smsTransaction)
      .returning();
    return newSmsTransaction;
  }

  async getUnconfirmedSmsTransactions(userId: string): Promise<SmsTransaction[]> {
    return await db
      .select()
      .from(smsTransactions)
      .where(and(eq(smsTransactions.userId, userId), eq(smsTransactions.isConfirmed, false)))
      .orderBy(desc(smsTransactions.createdAt));
  }

  async confirmSmsTransaction(id: string, userId: string, itemName?: string, supplierName?: string, categoryId?: string): Promise<SmsTransaction | undefined> {
    const [updatedSmsTransaction] = await db
      .update(smsTransactions)
      .set({
        isConfirmed: true,
        itemName,
        supplierName,
      })
      .where(and(eq(smsTransactions.id, id), eq(smsTransactions.userId, userId)))
      .returning();
    return updatedSmsTransaction;
  }

  // Supplier operations
  async getSuppliers(userId: string): Promise<Supplier[]> {
    return await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.userId, userId))
      .orderBy(desc(suppliers.lastTransactionDate));
  }

  async getSupplierByPhone(userId: string, phone: string): Promise<Supplier | undefined> {
    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(and(eq(suppliers.userId, userId), eq(suppliers.phone, phone)));
    return supplier;
  }

  async createSupplier(supplier: InsertSupplier & { userId: string }): Promise<Supplier> {
    const [newSupplier] = await db
      .insert(suppliers)
      .values(supplier)
      .returning();
    return newSupplier;
  }

  async updateSupplierItems(supplierId: string, userId: string, newItem: string): Promise<void> {
    const supplier = await db
      .select()
      .from(suppliers)
      .where(and(eq(suppliers.id, supplierId), eq(suppliers.userId, userId)));

    if (supplier[0]) {
      const currentItems = supplier[0].commonItems || [];
      if (!currentItems.includes(newItem)) {
        currentItems.push(newItem);
        await db
          .update(suppliers)
          .set({ 
            commonItems: currentItems,
            updatedAt: new Date()
          })
          .where(and(eq(suppliers.id, supplierId), eq(suppliers.userId, userId)));
      }
    }
  }

  // Item operations
  async getItems(userId: string, categoryId?: string): Promise<Item[]> {
    const conditions = [eq(items.userId, userId)];
    if (categoryId) {
      conditions.push(eq(items.categoryId, categoryId));
    }

    return await db
      .select()
      .from(items)
      .where(and(...conditions))
      .orderBy(items.name);
  }

  async getItemByName(userId: string, name: string): Promise<Item | undefined> {
    const [item] = await db
      .select()
      .from(items)
      .where(and(eq(items.userId, userId), eq(items.name, name)));
    return item;
  }

  async createItem(item: InsertItem & { userId: string }): Promise<Item> {
    const [newItem] = await db
      .insert(items)
      .values(item)
      .returning();
    return newItem;
  }

  async updateItemPrice(itemId: string, userId: string, price: number): Promise<void> {
    const existingItem = await db
      .select()
      .from(items)
      .where(and(eq(items.id, itemId), eq(items.userId, userId)));

    if (existingItem[0]) {
      const currentAvg = Number(existingItem[0].avgPrice) || 0;
      const purchaseCount = Number(existingItem[0].purchaseCount) || 0;
      const newAvg = purchaseCount === 0 ? price : (currentAvg * purchaseCount + price) / (purchaseCount + 1);

      await db
        .update(items)
        .set({
          avgPrice: newAvg.toString(),
          lastPrice: price.toString(),
          purchaseCount: (purchaseCount + 1).toString(),
          updatedAt: new Date(),
        })
        .where(and(eq(items.id, itemId), eq(items.userId, userId)));
    }
  }
}

export const storage = new DatabaseStorage();

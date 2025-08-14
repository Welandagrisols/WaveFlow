import {
  users,
  categories,
  transactions,
  paymentReminders,
  type User,
  type UpsertUser,
  type Transaction,
  type InsertTransaction,
  type Category,
  type InsertCategory,
  type PaymentReminder,
  type InsertPaymentReminder,
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
}

export const storage = new DatabaseStorage();

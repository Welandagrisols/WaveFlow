import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  decimal,
  text,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  businessName: varchar("business_name").default("My Business"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories for transaction classification
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  isBusiness: boolean("is_business").notNull().default(true),
  color: varchar("color").default("#0066CC"),
  icon: varchar("icon").default("fas fa-tag"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  currency: varchar("currency").default("KES"),
  direction: varchar("direction").notNull(), // 'IN' or 'OUT'
  description: varchar("description").notNull(),
  payeePhone: varchar("payee_phone"),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  transactionType: varchar("transaction_type").notNull(), // 'MPESA', 'BANK', 'CASH'
  reference: varchar("reference"),
  notes: text("notes"),
  isPersonal: boolean("is_personal").default(false),
  isLoan: boolean("is_loan").default(false), // Track if this is a loan to someone
  loanRecipient: varchar("loan_recipient"), // Name of person who received the loan
  expectedRepaymentDate: timestamp("expected_repayment_date"), // When loan should be repaid
  isRepaid: boolean("is_repaid").default(false), // Track if loan has been repaid
  status: varchar("status").default("COMPLETED"), // 'PENDING', 'COMPLETED', 'FAILED'
  transactionDate: timestamp("transaction_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment reminders/tracking
export const paymentReminders = pgTable("payment_reminders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  currency: varchar("currency").default("KES"),
  recipientPhone: varchar("recipient_phone"),
  dueDate: timestamp("due_date").notNull(),
  status: varchar("status").default("PENDING"), // 'PENDING', 'COMPLETED', 'OVERDUE'
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// SMS transactions table for automatic M-Pesa detection
export const smsTransactions = pgTable("sms_transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  smsText: text("sms_text").notNull(),
  senderNumber: varchar("sender_number"), // M-PESA, etc.
  simCard: varchar("sim_card").notNull(), // 'SIM1' or 'SIM2'
  accountType: varchar("account_type").notNull().default("business"), // 'business' or 'personal'
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  recipientPhone: varchar("recipient_phone"),
  recipientName: varchar("recipient_name"),
  transactionCode: varchar("transaction_code"),
  balance: decimal("balance", { precision: 14, scale: 2 }),
  isConfirmed: boolean("is_confirmed").default(false),
  transactionId: uuid("transaction_id").references(() => transactions.id, { onDelete: "set null" }),
  itemName: varchar("item_name"), // What was purchased
  supplierName: varchar("supplier_name"), // Learned supplier name
  createdAt: timestamp("created_at").defaultNow(),
});

// Suppliers/payees learning table
export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  phone: varchar("phone").notNull(),
  commonItems: text("common_items").array(), // Array of commonly purchased items
  defaultCategoryId: uuid("default_category_id").references(() => categories.id, { onDelete: "set null" }),
  isPersonal: boolean("is_personal").default(false),
  totalTransactions: decimal("total_transactions", { precision: 10, scale: 0 }).default("0"),
  lastTransactionDate: timestamp("last_transaction_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Items tracking for detailed expense analysis
export const items = pgTable("items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  avgPrice: decimal("avg_price", { precision: 14, scale: 2 }),
  lastPrice: decimal("last_price", { precision: 14, scale: 2 }),
  unit: varchar("unit").default("piece"), // kg, liter, piece, etc.
  supplierId: uuid("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
  purchaseCount: decimal("purchase_count", { precision: 10, scale: 0 }).default("0"),
  isPersonal: boolean("is_personal").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema exports for forms
export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertPaymentReminderSchema = createInsertSchema(paymentReminders).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertSmsTransactionSchema = createInsertSchema(smsTransactions).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type PaymentReminder = typeof paymentReminders.$inferSelect;
export type InsertPaymentReminder = z.infer<typeof insertPaymentReminderSchema>;
export type SmsTransaction = typeof smsTransactions.$inferSelect;
export type InsertSmsTransaction = z.infer<typeof insertSmsTransactionSchema>;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;

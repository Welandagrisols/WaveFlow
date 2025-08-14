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

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type PaymentReminder = typeof paymentReminders.$inferSelect;
export type InsertPaymentReminder = z.infer<typeof insertPaymentReminderSchema>;

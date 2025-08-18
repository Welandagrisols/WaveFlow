import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Use Supabase connection
const connectionString = process.env.DATABASE_URL || `postgresql://postgres:[YOUR-PASSWORD]@db.${process.env.SUPABASE_URL?.split('//')[1]?.split('.')[0]}.supabase.co:5432/postgres`;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL must be set. Please configure your Supabase connection string.",
  );
}

// Create postgres client with connection pooling
const client = postgres(connectionString, { 
  ssl: 'require',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
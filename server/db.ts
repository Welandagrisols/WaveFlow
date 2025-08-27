import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Use Supabase connection
const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

let db = null;

if (!connectionString) {
  console.warn("No database URL found. App will run in demo mode.");
  db = null;
} else {
  try {
    // Create postgres client with connection pooling
    const client = postgres(connectionString, { 
      ssl: 'require',
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    
    db = drizzle(client, { schema });
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    console.warn("Running in demo mode without database");
    db = null;
  }
}

export { db };
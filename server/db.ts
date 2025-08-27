import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "../shared/schema";

// Use database connection with proper SSL handling
const connectionString = process.env.DATABASE_URL;

let db = null;

if (!connectionString) {
  console.warn("No database URL found. Database connection required.");
  db = null;
} else {
  try {
    // Create postgres client with connection pooling and better SSL handling
    const client = postgres(connectionString, {
      ssl: connectionString.includes('localhost') ? false : 'require',
      max: 5,
      idle_timeout: 20,
      connect_timeout: 30,
      onnotice: () => {}, // Suppress notices
    });

    db = drizzle(client, { schema });
    console.log("Database client initialized successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    console.warn("Database connection required");
    db = null;
  }
}

export { db };
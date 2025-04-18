import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import * as schema from './shared/schema';

// This script runs database migrations using Drizzle ORM

async function main() {
  console.log('Starting database migration...');
  
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }

  // Connect to the database
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  
  try {
    // Push the current schema to the database (creates tables if they don't exist)
    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('Migrations complete!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
  
  // Close the connection
  await pool.end();
  console.log('Database connection closed.');
}

main().catch(console.error);
import { sql } from 'drizzle-orm';
import { pool } from './server/db';

async function main() {
  try {
    // First, check if age and sex columns exist
    const checkAgeColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'age'
    `);
    
    const checkSexColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'sex'
    `);
    
    // Add age column if it doesn't exist
    if (checkAgeColumn.rows.length === 0) {
      console.log('Adding age column to users table');
      await pool.query(`ALTER TABLE users ADD COLUMN age integer`);
    } else {
      console.log('Age column already exists');
    }
    
    // Add sex column if it doesn't exist
    if (checkSexColumn.rows.length === 0) {
      console.log('Adding sex column to users table');
      await pool.query(`ALTER TABLE users ADD COLUMN sex text`);
    } else {
      console.log('Sex column already exists');
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

main();
import { Pool } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

async function runMigration() {
  try {
    console.log('🚀 Starting database migration...');
    
    const sqlFilePath = path.join(__dirname, 'init-db.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    const client = await pool.connect();
    
    try {
      await client.query(sql);
      console.log('✅ Database migration completed successfully!');
      console.log('✅ Tables created: admin_users, admin_sessions, admin_audit_log');
      console.log('✅ Indexes created for optimal performance');
      console.log('✅ Default admin user inserted (email: admin@thestrong.com)');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { config } from './config.js';

const pool = new Pool({
  connectionString: config.db.url
});

export const db = drizzle(pool); 
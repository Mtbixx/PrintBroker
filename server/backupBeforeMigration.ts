
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function createBackupBeforeMigration() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup_before_migration_${timestamp}.sql`;
    
    // PostgreSQL backup komutu
    await execAsync(`pg_dump $DATABASE_URL > /tmp/${backupName}`);
    
    console.log(`✅ Database backup created: ${backupName}`);
    return backupName;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

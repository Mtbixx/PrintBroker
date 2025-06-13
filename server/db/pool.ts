import { Pool, PoolClient } from 'pg';
import { config } from '../config';

export class DatabasePool {
  private static instance: DatabasePool;
  private pool: Pool;
  private isHealthy: boolean = true;

  private constructor() {
    this.pool = new Pool({
      connectionString: config.database.url,
      ...config.database.pool,
      // Bağlantı havuzu ayarları
      max: 20, // Maksimum bağlantı sayısı
      min: 4, // Minimum bağlantı sayısı
      idleTimeoutMillis: 30000, // Boşta kalma süresi
      connectionTimeoutMillis: 2000, // Bağlantı zaman aşımı
      maxUses: 7500, // Bir bağlantının maksimum kullanım sayısı
    });

    // Bağlantı havuzu olaylarını dinle
    this.pool.on('connect', (client: PoolClient) => {
      console.log('Yeni veritabanı bağlantısı oluşturuldu');
    });

    this.pool.on('error', (err: Error, client: PoolClient) => {
      console.error('Veritabanı bağlantı hatası:', err);
      this.isHealthy = false;
    });

    this.pool.on('remove', (client: PoolClient) => {
      console.log('Veritabanı bağlantısı kaldırıldı');
    });

    // Periyodik sağlık kontrolü
    setInterval(() => this.checkHealth(), 30000);
  }

  public static getInstance(): DatabasePool {
    if (!DatabasePool.instance) {
      DatabasePool.instance = new DatabasePool();
    }
    return DatabasePool.instance;
  }

  private async checkHealth(): Promise<void> {
    try {
      const client = await this.pool.connect();
      try {
        await client.query('SELECT 1');
        this.isHealthy = true;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Veritabanı sağlık kontrolü başarısız:', error);
      this.isHealthy = false;
    }
  }

  public async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    if (!this.isHealthy) {
      throw new Error('Veritabanı bağlantısı sağlıksız');
    }

    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  public async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  public async end(): Promise<void> {
    await this.pool.end();
  }

  public getPoolStats(): {
    totalCount: number;
    idleCount: number;
    waitingCount: number;
    isHealthy: boolean;
  } {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
      isHealthy: this.isHealthy
    };
  }
}

export const dbPool = DatabasePool.getInstance(); 
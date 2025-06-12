import { dbPool } from './pool';

export class IndexManager {
  // İndeks oluştur
  async createIndex(
    table: string,
    columns: string[],
    options: {
      type?: 'btree' | 'hash' | 'gist' | 'gin';
      unique?: boolean;
      partial?: string;
      concurrent?: boolean;
    } = {}
  ): Promise<void> {
    try {
      const {
        type = 'btree',
        unique = false,
        partial = '',
        concurrent = false
      } = options;

      const indexName = this.generateIndexName(table, columns);
      const columnsStr = columns.join(', ');
      const uniqueStr = unique ? 'UNIQUE' : '';
      const concurrentStr = concurrent ? 'CONCURRENTLY' : '';
      const partialStr = partial ? `WHERE ${partial}` : '';

      const query = `
        CREATE ${uniqueStr} INDEX ${concurrentStr} ${indexName}
        ON ${table} USING ${type} (${columnsStr})
        ${partialStr}
      `;

      await dbPool.query(query);
      console.log(`İndeks oluşturuldu: ${indexName}`);
    } catch (error) {
      console.error('İndeks oluşturma hatası:', error);
      throw error;
    }
  }

  // İndeks sil
  async dropIndex(
    table: string,
    columns: string[],
    options: { concurrent?: boolean } = {}
  ): Promise<void> {
    try {
      const { concurrent = false } = options;
      const indexName = this.generateIndexName(table, columns);
      const concurrentStr = concurrent ? 'CONCURRENTLY' : '';

      const query = `DROP INDEX ${concurrentStr} ${indexName}`;
      await dbPool.query(query);
      console.log(`İndeks silindi: ${indexName}`);
    } catch (error) {
      console.error('İndeks silme hatası:', error);
      throw error;
    }
  }

  // İndeks yeniden oluştur
  async rebuildIndex(
    table: string,
    columns: string[]
  ): Promise<void> {
    try {
      const indexName = this.generateIndexName(table, columns);
      const query = `REINDEX INDEX ${indexName}`;
      await dbPool.query(query);
      console.log(`İndeks yeniden oluşturuldu: ${indexName}`);
    } catch (error) {
      console.error('İndeks yeniden oluşturma hatası:', error);
      throw error;
    }
  }

  // İndeks kullanım istatistiklerini al
  async getIndexStats(): Promise<{
    tableName: string;
    indexName: string;
    scans: number;
    rowsRead: number;
    rowsFetched: number;
    size: number;
  }[]> {
    try {
      const query = `
        SELECT
          schemaname || '.' || tablename as table_name,
          indexname as index_name,
          idx_scan as scans,
          idx_tup_read as rows_read,
          idx_tup_fetch as rows_fetched,
          pg_size_pretty(pg_relation_size(schemaname || '.' || indexname::regclass)) as size
        FROM pg_stat_user_indexes
        ORDER BY idx_scan DESC
      `;

      const result = await dbPool.query(query);
      return result.map((row: any) => ({
        tableName: row.table_name,
        indexName: row.index_name,
        scans: parseInt(row.scans),
        rowsRead: parseInt(row.rows_read),
        rowsFetched: parseInt(row.rows_fetched),
        size: row.size
      }));
    } catch (error) {
      console.error('İndeks istatistikleri alma hatası:', error);
      throw error;
    }
  }

  // Kullanılmayan indeksleri bul
  async findUnusedIndexes(): Promise<{
    tableName: string;
    indexName: string;
    size: number;
    lastUsed: Date;
  }[]> {
    try {
      const query = `
        SELECT
          schemaname || '.' || tablename as table_name,
          indexname as index_name,
          pg_size_pretty(pg_relation_size(schemaname || '.' || indexname::regclass)) as size,
          last_idx_scan as last_used
        FROM pg_stat_user_indexes
        WHERE idx_scan = 0
        ORDER BY pg_relation_size(schemaname || '.' || indexname::regclass) DESC
      `;

      const result = await dbPool.query(query);
      return result.map((row: any) => ({
        tableName: row.table_name,
        indexName: row.index_name,
        size: row.size,
        lastUsed: row.last_used
      }));
    } catch (error) {
      console.error('Kullanılmayan indeksleri bulma hatası:', error);
      throw error;
    }
  }

  // İndeks boyutlarını analiz et
  async analyzeIndexSizes(): Promise<{
    tableName: string;
    totalSize: number;
    indexSizes: { name: string; size: number }[];
  }[]> {
    try {
      const query = `
        SELECT
          schemaname || '.' || tablename as table_name,
          pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename::regclass)) as total_size,
          array_agg(indexname || ': ' || pg_size_pretty(pg_relation_size(schemaname || '.' || indexname::regclass))) as index_sizes
        FROM pg_stat_user_indexes
        GROUP BY schemaname, tablename
        ORDER BY pg_total_relation_size(schemaname || '.' || tablename::regclass) DESC
      `;

      const result = await dbPool.query(query);
      return result.map((row: any) => ({
        tableName: row.table_name,
        totalSize: row.total_size,
        indexSizes: row.index_sizes.map((size: string) => {
          const [name, sizeStr] = size.split(': ');
          return { name, size: sizeStr };
        })
      }));
    } catch (error) {
      console.error('İndeks boyutları analiz hatası:', error);
      throw error;
    }
  }

  // İndeks adı oluştur
  private generateIndexName(table: string, columns: string[]): string {
    const tableName = table.split('.').pop() || table;
    const columnsStr = columns.join('_');
    return `idx_${tableName}_${columnsStr}`;
  }
}

// Singleton instance
export const indexManager = new IndexManager(); 
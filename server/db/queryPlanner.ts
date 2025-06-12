import { dbPool } from './pool';

export class QueryPlanner {
  // Sorgu planını analiz et
  async analyzeQuery(query: string, params: any[] = []): Promise<any> {
    try {
      const result = await dbPool.query(`EXPLAIN ANALYZE ${query}`, params);
      return this.parseExplainResult(result);
    } catch (error) {
      console.error('Sorgu analizi hatası:', error);
      throw error;
    }
  }

  // Sorgu planını ayrıştır
  private parseExplainResult(result: any): any {
    const plan = {
      executionTime: 0,
      rows: 0,
      cost: {
        startup: 0,
        total: 0
      },
      operations: [] as any[]
    };

    for (const row of result) {
      const explain = row['QUERY PLAN'];
      if (typeof explain === 'string') {
        // Zaman bilgisini çıkar
        const timeMatch = explain.match(/actual time=(\d+\.\d+)\.\.(\d+\.\d+)/);
        if (timeMatch) {
          plan.executionTime += parseFloat(timeMatch[2]);
        }

        // Satır sayısını çıkar
        const rowsMatch = explain.match(/rows=(\d+)/);
        if (rowsMatch) {
          plan.rows += parseInt(rowsMatch[1]);
        }

        // Maliyet bilgisini çıkar
        const costMatch = explain.match(/cost=(\d+\.\d+)\.\.(\d+\.\d+)/);
        if (costMatch) {
          plan.cost.startup = parseFloat(costMatch[1]);
          plan.cost.total = parseFloat(costMatch[2]);
        }

        // İşlem tipini çıkar
        const operationMatch = explain.match(/^([A-Za-z ]+)/);
        if (operationMatch) {
          plan.operations.push({
            type: operationMatch[1].trim(),
            details: explain
          });
        }
      }
    }

    return plan;
  }

  // Sorgu performansını iyileştir
  async optimizeQuery(query: string, params: any[] = []): Promise<{
    originalPlan: any;
    optimizedPlan: any;
    suggestions: string[];
  }> {
    try {
      const originalPlan = await this.analyzeQuery(query, params);
      const suggestions: string[] = [];

      // İndeks önerileri
      if (originalPlan.operations.some((op: any) => 
        op.type.includes('Seq Scan') || op.type.includes('Filter'))) {
        suggestions.push('İlgili sütunlar için indeks oluşturulması önerilir');
      }

      // JOIN optimizasyonu
      if (originalPlan.operations.some((op: any) => 
        op.type.includes('Nested Loop'))) {
        suggestions.push('JOIN sıralaması optimize edilebilir');
      }

      // Sıralama optimizasyonu
      if (originalPlan.operations.some((op: any) => 
        op.type.includes('Sort'))) {
        suggestions.push('Sıralama için indeks kullanılabilir');
      }

      // Alt sorgu optimizasyonu
      if (originalPlan.operations.some((op: any) => 
        op.type.includes('Subquery'))) {
        suggestions.push('Alt sorgular JOIN ile değiştirilebilir');
      }

      // Optimize edilmiş sorgu planı
      const optimizedPlan = await this.analyzeQuery(
        this.applyOptimizations(query, suggestions),
        params
      );

      return {
        originalPlan,
        optimizedPlan,
        suggestions
      };
    } catch (error) {
      console.error('Sorgu optimizasyonu hatası:', error);
      throw error;
    }
  }

  // Optimizasyon önerilerini uygula
  private applyOptimizations(query: string, suggestions: string[]): string {
    let optimizedQuery = query;

    // İndeks kullanımı
    if (suggestions.includes('İlgili sütunlar için indeks oluşturulması önerilir')) {
      // WHERE koşullarını analiz et ve indeks öner
      const whereMatch = query.match(/WHERE\s+(.+?)(?:ORDER BY|GROUP BY|LIMIT|$)/i);
      if (whereMatch) {
        const conditions = whereMatch[1].split('AND');
        for (const condition of conditions) {
          const columnMatch = condition.match(/(\w+)\s*[=<>]/);
          if (columnMatch) {
            optimizedQuery += `\n-- İndeks önerisi: CREATE INDEX ON table_name (${columnMatch[1]})`;
          }
        }
      }
    }

    // JOIN optimizasyonu
    if (suggestions.includes('JOIN sıralaması optimize edilebilir')) {
      // JOIN sıralamasını değiştir
      optimizedQuery = optimizedQuery.replace(
        /JOIN\s+(\w+)\s+ON\s+(.+?)(?:WHERE|GROUP BY|ORDER BY|LIMIT|$)/i,
        'JOIN $1 ON $2'
      );
    }

    // Sıralama optimizasyonu
    if (suggestions.includes('Sıralama için indeks kullanılabilir')) {
      const orderMatch = query.match(/ORDER BY\s+(.+?)(?:LIMIT|$)/i);
      if (orderMatch) {
        const columns = orderMatch[1].split(',').map(col => col.trim());
        optimizedQuery += `\n-- Sıralama indeksi önerisi: CREATE INDEX ON table_name (${columns.join(', ')})`;
      }
    }

    // Alt sorgu optimizasyonu
    if (suggestions.includes('Alt sorgular JOIN ile değiştirilebilir')) {
      // Alt sorguları JOIN'e dönüştür
      optimizedQuery = optimizedQuery.replace(
        /WHERE\s+EXISTS\s*\(\s*SELECT\s+1\s+FROM\s+(\w+)\s+WHERE\s+(.+?)\s*\)/i,
        'JOIN $1 ON $2'
      );
    }

    return optimizedQuery;
  }

  // Sorgu istatistiklerini topla
  async collectQueryStats(): Promise<{
    totalQueries: number;
    avgExecutionTime: number;
    slowQueries: any[];
  }> {
    try {
      const result = await dbPool.query(`
        SELECT query, calls, total_time, mean_time
        FROM pg_stat_statements
        ORDER BY mean_time DESC
        LIMIT 10
      `);

      const stats = {
        totalQueries: result.reduce((sum: number, row: any) => sum + row.calls, 0),
        avgExecutionTime: result.reduce((sum: number, row: any) => sum + row.mean_time, 0) / result.length,
        slowQueries: result.map((row: any) => ({
          query: row.query,
          calls: row.calls,
          totalTime: row.total_time,
          meanTime: row.mean_time
        }))
      };

      return stats;
    } catch (error) {
      console.error('Sorgu istatistikleri toplama hatası:', error);
      throw error;
    }
  }
}

// Singleton instance
export const queryPlanner = new QueryPlanner(); 
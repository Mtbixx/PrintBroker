import { config } from '../config/index.js';

export class MetricsService {
  private readonly prefix = 'metrics:';
  private readonly retentionPeriod = 7 * 24 * 60 * 60; // 7 gün

  // Metrik kaydetme
  async recordMetric(name: string, value: number, tags: Record<string, string> = {}): Promise<void> {
    const key = this.generateKey(name, tags);
    const timestamp = Date.now();

    try {
      // Placeholder for the removed redis.zadd
    } catch (error) {
      console.error('Metrik kaydetme hatası:', error);
    }
  }

  // Metrik alma
  async getMetric(name: string, tags: Record<string, string> = {}, timeRange: { start: number; end: number }): Promise<Array<{ timestamp: number; value: number }>> {
    const key = this.generateKey(name, tags);

    try {
      // Placeholder for the removed redis.zrangebyscore
      return [];
    } catch (error) {
      console.error('Metrik alma hatası:', error);
      return [];
    }
  }

  // Metrik istatistikleri
  async getMetricStats(name: string, tags: Record<string, string> = {}, timeRange: { start: number; end: number }): Promise<{
    count: number;
    sum: number;
    avg: number;
    min: number;
    max: number;
  }> {
    const metrics = await this.getMetric(name, tags, timeRange);
    
    if (metrics.length === 0) {
      return {
        count: 0,
        sum: 0,
        avg: 0,
        min: 0,
        max: 0
      };
    }

    const values = metrics.map(m => m.value);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: metrics.length,
      sum,
      avg: sum / metrics.length,
      min: Math.min(...values),
      max: Math.max(...values)
    };
  }

  // Sistem metriklerini topla
  async collectSystemMetrics(): Promise<void> {
    const metrics = {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      uptime: process.uptime()
    };

    await this.recordMetric('system.memory.heapUsed', metrics.memory.heapUsed);
    await this.recordMetric('system.memory.heapTotal', metrics.memory.heapTotal);
    await this.recordMetric('system.memory.rss', metrics.memory.rss);
    await this.recordMetric('system.cpu.user', metrics.cpu.user);
    await this.recordMetric('system.cpu.system', metrics.cpu.system);
    await this.recordMetric('system.uptime', metrics.uptime);
  }

  // API metriklerini topla
  async collectApiMetrics(path: string, method: string, statusCode: number, duration: number): Promise<void> {
    await this.recordMetric('api.request.duration', duration, { path, method, status: statusCode.toString() });
    await this.recordMetric('api.request.count', 1, { path, method, status: statusCode.toString() });
  }

  // Veritabanı metriklerini topla
  async collectDatabaseMetrics(operation: string, duration: number, success: boolean): Promise<void> {
    await this.recordMetric('database.operation.duration', duration, { operation, success: success.toString() });
    await this.recordMetric('database.operation.count', 1, { operation, success: success.toString() });
  }

  // Redis metriklerini topla
  async collectRedisMetrics(operation: string, duration: number, success: boolean): Promise<void> {
    await this.recordMetric('redis.operation.duration', duration, { operation, success: success.toString() });
    await this.recordMetric('redis.operation.count', 1, { operation, success: success.toString() });
  }

  // Eski metrikleri temizle
  async cleanupOldMetrics(): Promise<void> {
    // Placeholder for the removed redis.keys
  }

  private generateKey(name: string, tags: Record<string, string>): string {
    const tagString = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(',');

    return `${this.prefix}${name}${tagString ? `:${tagString}` : ''}`;
  }
}

export const metricsService = new MetricsService(); 
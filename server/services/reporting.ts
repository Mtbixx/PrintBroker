import { metricsService } from './metrics';
import { loggerService } from './logger';
import { redis } from '../db/redis';
import { pool } from '../db/pool';

export class ReportingService {
  private readonly reportCacheTTL = 60 * 60; // 1 saat

  // Performans raporu oluştur
  async generatePerformanceReport(timeRange: { start: number; end: number }): Promise<any> {
    try {
      // API metrikleri
      const apiMetrics = await metricsService.getMetricStats(
        'api.request.duration',
        {},
        timeRange
      );

      // Veritabanı metrikleri
      const dbMetrics = await metricsService.getMetricStats(
        'database.operation.duration',
        {},
        timeRange
      );

      // Redis metrikleri
      const redisMetrics = await metricsService.getMetricStats(
        'redis.operation.duration',
        {},
        timeRange
      );

      // Sistem metrikleri
      const systemMetrics = {
        memory: await metricsService.getMetricStats(
          'system.memory.heapUsed',
          {},
          timeRange
        ),
        cpu: await metricsService.getMetricStats(
          'system.cpu.user',
          {},
          timeRange
        )
      };

      return {
        api: {
          totalRequests: apiMetrics.count,
          averageResponseTime: apiMetrics.avg,
          minResponseTime: apiMetrics.min,
          maxResponseTime: apiMetrics.max
        },
        database: {
          totalOperations: dbMetrics.count,
          averageOperationTime: dbMetrics.avg,
          minOperationTime: dbMetrics.min,
          maxOperationTime: dbMetrics.max
        },
        redis: {
          totalOperations: redisMetrics.count,
          averageOperationTime: redisMetrics.avg,
          minOperationTime: redisMetrics.min,
          maxOperationTime: redisMetrics.max
        },
        system: {
          memory: {
            averageUsage: systemMetrics.memory.avg,
            maxUsage: systemMetrics.memory.max
          },
          cpu: {
            averageUsage: systemMetrics.cpu.avg,
            maxUsage: systemMetrics.cpu.max
          }
        }
      };
    } catch (error) {
      loggerService.error('Performans raporu oluşturma hatası:', error);
      throw error;
    }
  }

  // Hata raporu oluştur
  async generateErrorReport(timeRange: { start: number; end: number }): Promise<any> {
    try {
      // Hata sayılarını al
      const errorCounts = await redis.hgetall('error:counts');
      const totalErrors = Object.values(errorCounts).reduce(
        (sum, count) => sum + parseInt(count as string),
        0
      );

      // Hata detaylarını al
      const errorDetails = await redis.zrangebyscore(
        'error:details',
        timeRange.start,
        timeRange.end
      );

      return {
        totalErrors,
        errorCounts,
        recentErrors: errorDetails.map(detail => JSON.parse(detail))
      };
    } catch (error) {
      loggerService.error('Hata raporu oluşturma hatası:', error);
      throw error;
    }
  }

  // Kullanım istatistikleri raporu oluştur
  async generateUsageReport(timeRange: { start: number; end: number }): Promise<any> {
    try {
      // Aktif kullanıcı sayısı
      const activeUsers = await redis.scard('active:users');

      // Toplam istek sayısı
      const totalRequests = await metricsService.getMetricStats(
        'api.request.count',
        {},
        timeRange
      );

      // En çok kullanılan endpoint'ler
      const popularEndpoints = await redis.zrevrange(
        'endpoint:usage',
        0,
        9,
        'WITHSCORES'
      );

      // Veritabanı kullanım istatistikleri
      const dbStats = await pool.getStats();

      return {
        activeUsers,
        totalRequests: totalRequests.count,
        popularEndpoints: this.formatPopularEndpoints(popularEndpoints),
        database: {
          totalConnections: dbStats.total,
          activeConnections: dbStats.active,
          idleConnections: dbStats.idle
        }
      };
    } catch (error) {
      loggerService.error('Kullanım raporu oluşturma hatası:', error);
      throw error;
    }
  }

  // Sistem durumu raporu oluştur
  async generateSystemStatusReport(): Promise<any> {
    try {
      // Redis durumu
      const redisInfo = await redis.info();
      const redisStatus = this.parseRedisInfo(redisInfo);

      // Veritabanı durumu
      const dbStats = await pool.getStats();
      const dbHealth = await pool.checkHealth();

      // Sistem kaynakları
      const systemMetrics = {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        uptime: process.uptime()
      };

      return {
        redis: redisStatus,
        database: {
          stats: dbStats,
          health: dbHealth
        },
        system: {
          memory: {
            heapUsed: systemMetrics.memory.heapUsed,
            heapTotal: systemMetrics.memory.heapTotal,
            rss: systemMetrics.memory.rss
          },
          cpu: {
            user: systemMetrics.cpu.user,
            system: systemMetrics.cpu.system
          },
          uptime: systemMetrics.uptime
        }
      };
    } catch (error) {
      loggerService.error('Sistem durumu raporu oluşturma hatası:', error);
      throw error;
    }
  }

  // Raporu önbelleğe al
  async cacheReport(reportType: string, report: any): Promise<void> {
    const key = `report:${reportType}:${Date.now()}`;
    await redis.setex(key, this.reportCacheTTL, JSON.stringify(report));
  }

  // Önbellekten rapor al
  async getCachedReport(reportType: string): Promise<any | null> {
    const key = `report:${reportType}:${Date.now()}`;
    const report = await redis.get(key);
    return report ? JSON.parse(report) : null;
  }

  private formatPopularEndpoints(endpoints: string[]): Array<{ endpoint: string; count: number }> {
    const result = [];
    for (let i = 0; i < endpoints.length; i += 2) {
      result.push({
        endpoint: endpoints[i],
        count: parseInt(endpoints[i + 1])
      });
    }
    return result;
  }

  private parseRedisInfo(info: string): Record<string, any> {
    const lines = info.split('\n');
    const result: Record<string, any> = {};

    for (const line of lines) {
      const [key, value] = line.split(':');
      if (key && value) {
        result[key.trim()] = value.trim();
      }
    }

    return result;
  }
}

export const reportingService = new ReportingService(); 
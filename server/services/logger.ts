import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { config } from '../config';

// Log seviyeleri
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace'
}

// Log formatı
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Dosya rotasyon ayarları
const fileRotateTransport = new DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: logFormat
});

// Winston logger yapılandırması
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  format: logFormat,
  transports: [
    fileRotateTransport,
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

export class LoggerService {
  // Hata logu
  error(message: string, meta?: Record<string, any>): void {
    logger.error(message, { ...meta, timestamp: new Date().toISOString() });
  }

  // Uyarı logu
  warn(message: string, meta?: Record<string, any>): void {
    logger.warn(message, { ...meta, timestamp: new Date().toISOString() });
  }

  // Bilgi logu
  info(message: string, meta?: Record<string, any>): void {
    logger.info(message, { ...meta, timestamp: new Date().toISOString() });
  }

  // Debug logu
  debug(message: string, meta?: Record<string, any>): void {
    logger.debug(message, { ...meta, timestamp: new Date().toISOString() });
  }

  // İzleme logu
  trace(message: string, meta?: Record<string, any>): void {
    logger.verbose(message, { ...meta, timestamp: new Date().toISOString() });
  }

  // API isteği logu
  logApiRequest(req: any, res: any, duration: number): void {
    const meta = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };

    if (res.statusCode >= 500) {
      this.error('API Hatası', meta);
    } else if (res.statusCode >= 400) {
      this.warn('API Uyarısı', meta);
    } else {
      this.info('API İsteği', meta);
    }
  }

  // Veritabanı işlemi logu
  logDatabaseOperation(operation: string, duration: number, success: boolean, error?: Error): void {
    const meta = {
      operation,
      duration,
      success,
      error: error?.message
    };

    if (!success) {
      this.error('Veritabanı Hatası', meta);
    } else {
      this.debug('Veritabanı İşlemi', meta);
    }
  }

  // Redis işlemi logu
  logRedisOperation(operation: string, duration: number, success: boolean, error?: Error): void {
    const meta = {
      operation,
      duration,
      success,
      error: error?.message
    };

    if (!success) {
      this.error('Redis Hatası', meta);
    } else {
      this.debug('Redis İşlemi', meta);
    }
  }

  // Sistem olayı logu
  logSystemEvent(event: string, meta?: Record<string, any>): void {
    this.info(`Sistem Olayı: ${event}`, meta);
  }

  // Güvenlik olayı logu
  logSecurityEvent(event: string, meta?: Record<string, any>): void {
    this.warn(`Güvenlik Olayı: ${event}`, meta);
  }

  // Performans metrik logu
  logPerformanceMetric(name: string, value: number, tags?: Record<string, string>): void {
    this.debug('Performans Metriği', {
      name,
      value,
      tags,
      timestamp: new Date().toISOString()
    });
  }
}

export const loggerService = new LoggerService(); 
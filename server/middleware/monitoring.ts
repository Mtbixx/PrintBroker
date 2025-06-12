import { Request, Response, NextFunction } from 'express';
import { metricsService } from '../services/metrics';
import { loggerService } from '../services/logger';
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { config } from '../config';

// Sentry başlatma
Sentry.init({
  dsn: config.monitoring.sentryDsn,
  environment: config.app.env,
  integrations: [
    new ProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

// Sentry middleware
export const sentryMiddleware = Sentry.Handlers.requestHandler();

// Sentry error handler
export const sentryErrorHandler = Sentry.Handlers.errorHandler({
  shouldHandleError(error) {
    // Kritik hataları Sentry'ye gönder
    return error.status >= 500 || !error.status;
  },
});

// Hata izleme
export const captureException = (error: Error, context?: any) => {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setExtras(context);
    }
    Sentry.captureException(error);
  });
  
  // Hata logla
  loggerService.error('Uygulama hatası', { error, context });
};

// Performans izleme
export const startTransaction = (name: string, op: string) => {
  return Sentry.startTransaction({
    name,
    op,
  });
};

// Kullanıcı izleme
export const setUser = (user: { id: string; email: string; role: string }) => {
  Sentry.setUser(user);
};

// İşlem izleme
export const addBreadcrumb = (message: string, category: string, data?: any) => {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
};

// Özel metrik izleme
export const trackMetric = (name: string, value: number, tags?: Record<string, string>) => {
  Sentry.metrics.increment(name, value, tags);
};

// Performans izleme middleware
export const performanceMiddleware = (req: any, res: any, next: any) => {
  const transaction = startTransaction(`${req.method} ${req.path}`, 'http.server');
  
  res.on('finish', () => {
    transaction.setHttpStatus(res.statusCode);
    transaction.finish();
  });
  
  next();
};

// Kullanıcı izleme middleware
export const userTrackingMiddleware = (req: any, res: any, next: any) => {
  if (req.user) {
    setUser({
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    });
  }
  next();
};

// İşlem izleme middleware
export const breadcrumbMiddleware = (req: any, res: any, next: any) => {
  addBreadcrumb(
    `${req.method} ${req.path}`,
    'http',
    {
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body,
      user: req.user?.id,
    }
  );
  next();
};

// Performans izleme middleware'i
export const monitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Yanıt tamamlandığında metrikleri topla
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    // API metriklerini topla
    metricsService.collectApiMetrics(
      req.path,
      req.method,
      res.statusCode,
      duration
    );

    // API isteğini logla
    loggerService.logApiRequest(req, res, duration);

    // Sistem metriklerini topla
    metricsService.collectSystemMetrics();
  });

  next();
};

// Veritabanı izleme middleware'i
export const databaseMonitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Orijinal query metodunu sakla
  const originalQuery = req.app.locals.db.query;

  // Query metodunu değiştir
  req.app.locals.db.query = async (...args: any[]) => {
    const queryStartTime = Date.now();
    let success = true;
    let error: Error | undefined;

    try {
      const result = await originalQuery.apply(req.app.locals.db, args);
      return result;
    } catch (err) {
      success = false;
      error = err as Error;
      throw err;
    } finally {
      const queryDuration = Date.now() - queryStartTime;

      // Veritabanı metriklerini topla
      metricsService.collectDatabaseMetrics(
        'query',
        queryDuration,
        success
      );

      // Veritabanı işlemini logla
      loggerService.logDatabaseOperation(
        'query',
        queryDuration,
        success,
        error
      );
    }
  };

  next();
};

// Redis izleme middleware'i
export const redisMonitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Orijinal Redis metodlarını sakla
  const originalRedisMethods = {
    get: req.app.locals.redis.get,
    set: req.app.locals.redis.set,
    del: req.app.locals.redis.del
  };

  // Redis metodlarını değiştir
  Object.keys(originalRedisMethods).forEach(method => {
    req.app.locals.redis[method] = async (...args: any[]) => {
      const operationStartTime = Date.now();
      let success = true;
      let error: Error | undefined;

      try {
        const result = await originalRedisMethods[method].apply(req.app.locals.redis, args);
        return result;
      } catch (err) {
        success = false;
        error = err as Error;
        throw err;
      } finally {
        const operationDuration = Date.now() - operationStartTime;

        // Redis metriklerini topla
        metricsService.collectRedisMetrics(
          method,
          operationDuration,
          success
        );

        // Redis işlemini logla
        loggerService.logRedisOperation(
          method,
          operationDuration,
          success,
          error
        );
      }
    };
  });

  next();
};

// Performans uyarı middleware'i
export const performanceAlertMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const thresholds = {
    api: 1000, // 1 saniye
    database: 500, // 500 milisaniye
    redis: 100 // 100 milisaniye
  };

  // Yanıt tamamlandığında performans kontrolü yap
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    // API yanıt süresi kontrolü
    if (duration > thresholds.api) {
      loggerService.warn('Yüksek API Yanıt Süresi', {
        path: req.path,
        method: req.method,
        duration,
        threshold: thresholds.api
      });
    }

    // Sistem kaynakları kontrolü
    const memoryUsage = process.memoryUsage();
    const heapUsedPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    if (heapUsedPercentage > 80) {
      loggerService.warn('Yüksek Bellek Kullanımı', {
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        percentage: heapUsedPercentage
      });
    }
  });

  next();
}; 
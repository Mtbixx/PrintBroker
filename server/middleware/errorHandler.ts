import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCodes, ErrorMessages } from '../errors/AppError';
import { loggerService } from '../services/logger';
import { metricsService } from '../services/metrics';

// Hata yönetimi middleware'i
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Hata logla
  loggerService.error('Hata oluştu', {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err instanceof AppError ? err.code : ErrorCodes.SERVER_ERROR
    },
    request: {
      method: req.method,
      url: req.url,
      params: req.params,
      query: req.query,
      body: req.body,
      ip: req.ip,
      userAgent: req.get('user-agent')
    }
  });

  // Metrik topla
  metricsService.collectApiMetrics(
    req.path,
    req.method,
    err instanceof AppError ? err.statusCode : 500,
    Date.now() - (req as any).startTime
  );

  // AppError ise
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      }
    });
  }

  // ValidationError ise
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: ErrorCodes.VALIDATION_ERROR,
        message: ErrorMessages[ErrorCodes.VALIDATION_ERROR],
        details: (err as any).errors
      }
    });
  }

  // JWT hatası ise
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: ErrorCodes.AUTHENTICATION_ERROR,
        message: ErrorMessages[ErrorCodes.AUTHENTICATION_ERROR]
      }
    });
  }

  // JWT süresi dolmuşsa
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: ErrorCodes.AUTHENTICATION_ERROR,
        message: 'Oturum süresi doldu'
      }
    });
  }

  // Varsayılan sunucu hatası
  return res.status(500).json({
    success: false,
    error: {
      code: ErrorCodes.SERVER_ERROR,
      message: process.env.NODE_ENV === 'production'
        ? ErrorMessages[ErrorCodes.SERVER_ERROR]
        : err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

// 404 hatası middleware'i
export const notFoundHandler = (req: Request, res: Response) => {
  const err = new AppError(
    `İstenen kaynak bulunamadı: ${req.method} ${req.url}`,
    404,
    ErrorCodes.NOT_FOUND_ERROR
  );

  loggerService.warn('404 Hatası', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  res.status(404).json({
    success: false,
    error: {
      code: err.code,
      message: err.message
    }
  });
};

// Asenkron hata yakalama wrapper'ı
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Hata sınıflandırma
export const classifyError = (err: Error): AppError => {
  if (err instanceof AppError) {
    return err;
  }

  switch (err.name) {
    case 'ValidationError':
      return new AppError(
        ErrorMessages[ErrorCodes.VALIDATION_ERROR],
        400,
        ErrorCodes.VALIDATION_ERROR
      );

    case 'JsonWebTokenError':
    case 'TokenExpiredError':
      return new AppError(
        ErrorMessages[ErrorCodes.AUTHENTICATION_ERROR],
        401,
        ErrorCodes.AUTHENTICATION_ERROR
      );

    case 'SequelizeUniqueConstraintError':
      return new AppError(
        ErrorMessages[ErrorCodes.CONFLICT_ERROR],
        409,
        ErrorCodes.CONFLICT_ERROR
      );

    case 'SequelizeValidationError':
      return new AppError(
        ErrorMessages[ErrorCodes.VALIDATION_ERROR],
        400,
        ErrorCodes.VALIDATION_ERROR
      );

    default:
      return new AppError(
        ErrorMessages[ErrorCodes.SERVER_ERROR],
        500,
        ErrorCodes.SERVER_ERROR,
        false
      );
  }
}; 
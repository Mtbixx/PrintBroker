import { Request, Response, NextFunction } from 'express';
import compression from 'compression';
import { z } from 'zod';

// Sıkıştırma seçenekleri
const compressionOptions = {
  filter: (req: Request, res: Response) => {
    // Sıkıştırılacak MIME tipleri
    const compressibleTypes = [
      'text/plain',
      'text/html',
      'text/css',
      'text/javascript',
      'application/javascript',
      'application/json',
      'application/xml',
      'application/x-www-form-urlencoded'
    ];

    return compressibleTypes.includes(res.getHeader('Content-Type') as string);
  },
  level: 6, // Sıkıştırma seviyesi (1-9)
  threshold: 1024 // Minimum boyut (byte)
};

// Sıkıştırma middleware'i
export const compress = compression(compressionOptions);

// Yanıt boyutu optimizasyonu
export const optimizeResponse = (maxSize: number = 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;

    res.json = function(data: any) {
      const responseSize = JSON.stringify(data).length;

      if (responseSize > maxSize) {
        // Yanıt boyutu çok büyükse, sayfalama veya filtreleme öner
        return res.status(413).json({
          error: 'Yanıt boyutu çok büyük',
          message: 'Lütfen sayfalama veya filtreleme kullanın',
          maxSize,
          currentSize: responseSize
        });
      }

      return originalJson.call(this, data);
    };

    next();
  };
};

// İstek doğrulama
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Doğrulama hatası',
          details: error.errors
        });
      }
      next(error);
    }
  };
};

// Yanıt dönüştürme
export const transformResponse = (transformer: (data: any) => any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;

    res.json = function(data: any) {
      const transformedData = transformer(data);
      return originalJson.call(this, transformedData);
    };

    next();
  };
};

// Önbellek kontrolü
export const cacheControl = (maxAge: number = 3600) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
      res.setHeader('Expires', new Date(Date.now() + maxAge * 1000).toUTCString());
    } else {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    next();
  };
};

// CORS yapılandırması
export const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400 // 24 saat
};

// İstek boyutu sınırlaması
export const limitRequestSize = (maxSize: number = 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');

    if (contentLength > maxSize) {
      return res.status(413).json({
        error: 'İstek boyutu çok büyük',
        message: `Maksimum istek boyutu: ${maxSize} byte`,
        currentSize: contentLength
      });
    }

    next();
  };
};

// Yanıt sıkıştırma seviyesi
export const compressionLevel = (level: number = 6) => {
  return compression({
    ...compressionOptions,
    level
  });
};

// Yanıt filtreleme
export const filterResponse = (fields: string[]) => {
  return transformResponse((data: any) => {
    if (Array.isArray(data)) {
      return data.map(item => {
        const filtered: any = {};
        fields.forEach(field => {
          if (field in item) {
            filtered[field] = item[field];
          }
        });
        return filtered;
      });
    }
    return data;
  });
};

// Yanıt sıralama
export const sortResponse = (field: string, order: 'asc' | 'desc' = 'asc') => {
  return transformResponse((data: any) => {
    if (Array.isArray(data)) {
      return data.sort((a, b) => {
        const aValue = a[field];
        const bValue = b[field];
        return order === 'asc' 
          ? aValue > bValue ? 1 : -1
          : aValue < bValue ? 1 : -1;
      });
    }
    return data;
  });
}; 
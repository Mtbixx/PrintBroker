import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cache';

// Önbellek seçenekleri
interface CacheOptions {
  ttl?: number;
  key?: string;
  tags?: string[];
  skipCache?: boolean;
}

// Önbellek middleware'i
export const cache = (options: CacheOptions = {}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Önbelleği atla
    if (options.skipCache || req.method !== 'GET') {
      return next();
    }

    try {
      // Önbellek anahtarı oluştur
      const cacheKey = options.key || cacheService.createKey(req.path, {
        query: req.query,
        params: req.params,
        user: req.user?.userId
      });

      // Önbellekten veri al
      const cachedData = await cacheService.get(cacheKey);
      
      if (cachedData) {
        return res.json(cachedData);
      }

      // Orijinal json metodunu sakla
      const originalJson = res.json;

      // json metodunu override et
      res.json = function(data: any) {
        // Veriyi önbellekle
        cacheService.set(cacheKey, data, options.ttl).catch(error => {
          console.error('Önbellek yazma hatası:', error);
        });

        // Etiketleri önbellekle
        if (options.tags?.length) {
          const tagKey = `tags:${options.tags.join(':')}`;
          cacheService.set(tagKey, cacheKey, options.ttl).catch(error => {
            console.error('Etiket önbellek hatası:', error);
          });
        }

        // Orijinal json metodunu çağır
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Önbellek middleware hatası:', error);
      next();
    }
  };
};

// Önbellek temizleme middleware'i
export const clearCache = (tags?: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (tags?.length) {
        // Etiketlere göre önbelleği temizle
        const tagKey = `tags:${tags.join(':')}`;
        const cacheKeys = await cacheService.get<string[]>(tagKey) || [];
        
        await Promise.all([
          cacheService.delete(tagKey),
          ...cacheKeys.map(key => cacheService.delete(key))
        ]);
      } else {
        // Tüm önbelleği temizle
        await cacheService.clear();
      }

      next();
    } catch (error) {
      console.error('Önbellek temizleme hatası:', error);
      next();
    }
  };
};

// Önbellek durumu middleware'i
export const cacheStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = await cacheService.status();
    res.json(status);
  } catch (error) {
    console.error('Önbellek durum kontrolü hatası:', error);
    res.status(500).json({
      error: 'Önbellek durumu alınamadı',
      message: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
};

// Önbellek yapılandırması
export const cacheConfig = {
  // Varsayılan TTL değerleri (saniye)
  ttl: {
    short: 300,    // 5 dakika
    medium: 3600,  // 1 saat
    long: 86400,   // 24 saat
    veryLong: 604800 // 1 hafta
  },

  // Önbellek anahtarı önekleri
  prefix: {
    user: 'user',
    quote: 'quote',
    file: 'file',
    chat: 'chat',
    stats: 'stats'
  },

  // Önbellek etiketleri
  tags: {
    user: ['user'],
    quote: ['quote', 'user'],
    file: ['file', 'user'],
    chat: ['chat', 'user'],
    stats: ['stats']
  }
}; 
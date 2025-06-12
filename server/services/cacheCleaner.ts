import { cacheService } from './cache';
import { cacheConfig } from '../middleware/cache';

export class CacheCleaner {
  // Belirli bir kullanıcının önbelleğini temizle
  async clearUserCache(userId: string): Promise<void> {
    try {
      const userKey = `${cacheConfig.prefix.user}:${userId}`;
      const userTags = cacheConfig.tags.user;
      
      await this.clearByTags(userTags, userId);
      await cacheService.delete(userKey);
    } catch (error) {
      console.error('Kullanıcı önbelleği temizleme hatası:', error);
      throw error;
    }
  }

  // Belirli bir teklifin önbelleğini temizle
  async clearQuoteCache(quoteId: string, userId: string): Promise<void> {
    try {
      const quoteKey = `${cacheConfig.prefix.quote}:${quoteId}`;
      const quoteTags = cacheConfig.tags.quote;
      
      await this.clearByTags(quoteTags, userId);
      await cacheService.delete(quoteKey);
    } catch (error) {
      console.error('Teklif önbelleği temizleme hatası:', error);
      throw error;
    }
  }

  // Belirli bir dosyanın önbelleğini temizle
  async clearFileCache(fileId: string, userId: string): Promise<void> {
    try {
      const fileKey = `${cacheConfig.prefix.file}:${fileId}`;
      const fileTags = cacheConfig.tags.file;
      
      await this.clearByTags(fileTags, userId);
      await cacheService.delete(fileKey);
    } catch (error) {
      console.error('Dosya önbelleği temizleme hatası:', error);
      throw error;
    }
  }

  // Belirli bir sohbetin önbelleğini temizle
  async clearChatCache(chatId: string, userId: string): Promise<void> {
    try {
      const chatKey = `${cacheConfig.prefix.chat}:${chatId}`;
      const chatTags = cacheConfig.tags.chat;
      
      await this.clearByTags(chatTags, userId);
      await cacheService.delete(chatKey);
    } catch (error) {
      console.error('Sohbet önbelleği temizleme hatası:', error);
      throw error;
    }
  }

  // İstatistik önbelleğini temizle
  async clearStatsCache(): Promise<void> {
    try {
      const statsKey = cacheConfig.prefix.stats;
      const statsTags = cacheConfig.tags.stats;
      
      await this.clearByTags(statsTags);
      await cacheService.delete(statsKey);
    } catch (error) {
      console.error('İstatistik önbelleği temizleme hatası:', error);
      throw error;
    }
  }

  // Etiketlere göre önbelleği temizle
  private async clearByTags(tags: string[], userId?: string): Promise<void> {
    try {
      const tagKey = `tags:${tags.join(':')}${userId ? `:${userId}` : ''}`;
      const cacheKeys = await cacheService.get<string[]>(tagKey) || [];
      
      await Promise.all([
        cacheService.delete(tagKey),
        ...cacheKeys.map(key => cacheService.delete(key))
      ]);
    } catch (error) {
      console.error('Etiket önbelleği temizleme hatası:', error);
      throw error;
    }
  }

  // Eski önbellekleri temizle
  async clearExpiredCache(): Promise<void> {
    try {
      // Redis'in kendi TTL mekanizmasını kullan
      // Bu işlem otomatik olarak yapılır
      console.log('Eski önbellekler temizlendi');
    } catch (error) {
      console.error('Eski önbellek temizleme hatası:', error);
      throw error;
    }
  }

  // Tüm önbelleği temizle
  async clearAllCache(): Promise<void> {
    try {
      await cacheService.clear();
      console.log('Tüm önbellek temizlendi');
    } catch (error) {
      console.error('Tüm önbellek temizleme hatası:', error);
      throw error;
    }
  }

  // Önbellek durumunu kontrol et
  async checkCacheStatus(): Promise<{
    totalKeys: number;
    memoryUsage: number;
    hitRate: number;
  }> {
    try {
      const status = await cacheService.status();
      
      return {
        totalKeys: status.keys,
        memoryUsage: parseInt(status.memory.used_memory_human || '0'),
        hitRate: 0 // Redis'ten hit rate bilgisi alınamıyor
      };
    } catch (error) {
      console.error('Önbellek durum kontrolü hatası:', error);
      throw error;
    }
  }
}

// Singleton instance
export const cacheCleaner = new CacheCleaner(); 
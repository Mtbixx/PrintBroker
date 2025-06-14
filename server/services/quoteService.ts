import { PrismaClient } from '@prisma/client';
import { redisConfig } from '../config/redis.js';

const prisma = new PrismaClient();

export class QuoteService {
  // Canlı iş akışı verilerini getir
  async getLiveQuotes() {
    try {
      // Önbellekten verileri kontrol et
      const cachedQuotes = await redisConfig.get('live_quotes');
      if (cachedQuotes) {
        return cachedQuotes;
      }

      // Veritabanından verileri al
      const quotes = await prisma.quote.findMany({
        where: {
          status: {
            in: ['pending', 'in_progress', 'quality_check']
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10,
        include: {
          customer: {
            select: {
              companyName: true,
              location: true
            }
          }
        }
      });

      const formattedQuotes = quotes.map(quote => ({
        id: quote.id,
        title: quote.title,
        status: quote.status,
        amount: quote.amount,
        location: quote.customer.location,
        time: new Date(quote.createdAt).toLocaleTimeString('tr-TR')
      }));

      // Verileri önbelleğe al (30 saniye)
      await redisConfig.set('live_quotes', formattedQuotes, 30);

      return formattedQuotes;
    } catch (error) {
      console.error('Canlı iş akışı verileri alınamadı:', error);
      throw new Error('Canlı iş akışı verileri alınamadı');
    }
  }
}

export const quoteService = new QuoteService(); 
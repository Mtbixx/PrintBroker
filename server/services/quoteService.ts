import { prisma } from '../lib/prisma.js';
import { redisConfig } from '../config/redis.js';

export class QuoteService {
  private static instance: QuoteService;

  private constructor() {}

  public static getInstance(): QuoteService {
    if (!QuoteService.instance) {
      QuoteService.instance = new QuoteService();
    }
    return QuoteService.instance;
  }

  public async getLiveQuotes() {
    try {
      // Önce Redis'ten kontrol et
      const cachedQuotes = await redisConfig.get('live_quotes');
      if (cachedQuotes) {
        return cachedQuotes;
      }

      // Redis'te yoksa veritabanından al
      const quotes = await prisma.quote.findMany({
        where: {
          status: {
            in: ['pending', 'in_progress', 'quality_check']
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          customer: {
            select: {
              company: true,
              city: true
            }
          }
        },
        take: 10
      });

      // Mock veriler ekle
      const mockQuotes = [
        {
          id: 'mock_1',
          title: 'Kartvizit Baskı',
          status: 'pending',
          amount: 1500,
          location: 'İstanbul',
          time: new Date().toISOString()
        },
        {
          id: 'mock_2',
          title: 'Broşür Tasarım',
          status: 'in_progress',
          amount: 2500,
          location: 'Ankara',
          time: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'mock_3',
          title: 'Logo Tasarım',
          status: 'quality_check',
          amount: 3500,
          location: 'İzmir',
          time: new Date(Date.now() - 7200000).toISOString()
        }
      ];

      const formattedQuotes = [...quotes, ...mockQuotes].map(quote => ({
        id: quote.id,
        title: quote.title,
        status: quote.status,
        amount: quote.amount,
        location: quote.location || quote.customer?.city || 'Belirtilmemiş',
        time: quote.time || quote.createdAt
      }));

      // Redis'e kaydet (5 dakika TTL)
      await redisConfig.set('live_quotes', formattedQuotes, 300);

      return formattedQuotes;
    } catch (error) {
      console.error('Canlı teklifler alınamadı:', error);
      throw error;
    }
  }
}

export const quoteService = QuoteService.getInstance(); 
import express from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/optimize';
import { authMiddleware } from '../middleware/auth';
import { quoteService } from '../services/quote';

const router = express.Router();

// Teklif oluşturma şeması
const createQuoteSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  files: z.array(z.string().uuid()),
  quantity: z.number().min(1),
  specifications: z.record(z.string()).optional(),
  deadline: z.string().datetime().optional()
});

// Teklif güncelleme şeması
const updateQuoteSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'accepted', 'rejected', 'completed']).optional(),
  specifications: z.record(z.string()).optional(),
  deadline: z.string().datetime().optional()
});

// Teklif oluştur
router.post('/',
  authMiddleware,
  validateRequest(createQuoteSchema),
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const quoteData = req.body;
      
      const quote = await quoteService.createQuote(userId, quoteData);
      
      res.status(201).json({
        message: 'Teklif başarıyla oluşturuldu',
        quote
      });
    } catch (error) {
      console.error('Teklif oluşturma hatası:', error);
      res.status(500).json({
        error: 'Teklif oluşturma hatası',
        message: 'Teklif oluşturulurken bir hata oluştu'
      });
    }
  }
);

// Teklifleri listele
router.get('/',
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const { status, page = 1, limit = 10 } = req.query;
      
      const quotes = await quoteService.getUserQuotes(userId, {
        status: status as string,
        page: Number(page),
        limit: Number(limit)
      });
      
      res.json(quotes);
    } catch (error) {
      console.error('Teklif listeleme hatası:', error);
      res.status(500).json({
        error: 'Teklif listeleme hatası',
        message: 'Teklifler listelenirken bir hata oluştu'
      });
    }
  }
);

// Teklif detayı
router.get('/:id',
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const quoteId = req.params.id;
      
      const quote = await quoteService.getQuoteById(quoteId);
      
      if (!quote) {
        return res.status(404).json({
          error: 'Teklif bulunamadı',
          message: 'İstenen teklif mevcut değil'
        });
      }

      // Yetki kontrolü
      if (quote.userId !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          error: 'Yetki hatası',
          message: 'Bu teklife erişim izniniz yok'
        });
      }

      res.json(quote);
    } catch (error) {
      console.error('Teklif detay hatası:', error);
      res.status(500).json({
        error: 'Teklif detay hatası',
        message: 'Teklif detayları alınırken bir hata oluştu'
      });
    }
  }
);

// Teklif güncelle
router.put('/:id',
  authMiddleware,
  validateRequest(updateQuoteSchema),
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const quoteId = req.params.id;
      const updates = req.body;
      
      const quote = await quoteService.getQuoteById(quoteId);
      
      if (!quote) {
        return res.status(404).json({
          error: 'Teklif bulunamadı',
          message: 'Güncellenecek teklif mevcut değil'
        });
      }

      // Yetki kontrolü
      if (quote.userId !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          error: 'Yetki hatası',
          message: 'Bu teklifi güncelleme izniniz yok'
        });
      }

      const updatedQuote = await quoteService.updateQuote(quoteId, updates);
      
      res.json({
        message: 'Teklif başarıyla güncellendi',
        quote: updatedQuote
      });
    } catch (error) {
      console.error('Teklif güncelleme hatası:', error);
      res.status(500).json({
        error: 'Teklif güncelleme hatası',
        message: 'Teklif güncellenirken bir hata oluştu'
      });
    }
  }
);

// Teklif sil
router.delete('/:id',
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const quoteId = req.params.id;
      
      const quote = await quoteService.getQuoteById(quoteId);
      
      if (!quote) {
        return res.status(404).json({
          error: 'Teklif bulunamadı',
          message: 'Silinecek teklif mevcut değil'
        });
      }

      // Yetki kontrolü
      if (quote.userId !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          error: 'Yetki hatası',
          message: 'Bu teklifi silme izniniz yok'
        });
      }

      await quoteService.deleteQuote(quoteId);
      
      res.json({
        message: 'Teklif başarıyla silindi'
      });
    } catch (error) {
      console.error('Teklif silme hatası:', error);
      res.status(500).json({
        error: 'Teklif silme hatası',
        message: 'Teklif silinirken bir hata oluştu'
      });
    }
  }
);

export default router; 
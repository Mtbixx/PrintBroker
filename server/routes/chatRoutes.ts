import express from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/optimize';
import { authMiddleware } from '../middleware/auth';
import { chatService } from '../services/chat';

const router = express.Router();

// Mesaj gönderme şeması
const sendMessageSchema = z.object({
  quoteId: z.string().uuid(),
  content: z.string().min(1),
  attachments: z.array(z.string().uuid()).optional()
});

// Mesaj gönder
router.post('/messages',
  authMiddleware,
  validateRequest(sendMessageSchema),
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const { quoteId, content, attachments } = req.body;
      
      const message = await chatService.sendMessage({
        userId,
        quoteId,
        content,
        attachments
      });
      
      res.status(201).json({
        message: 'Mesaj başarıyla gönderildi',
        data: message
      });
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      res.status(500).json({
        error: 'Mesaj gönderme hatası',
        message: 'Mesaj gönderilirken bir hata oluştu'
      });
    }
  }
);

// Mesajları listele
router.get('/messages',
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const { quoteId, page = 1, limit = 50 } = req.query;
      
      if (!quoteId) {
        return res.status(400).json({
          error: 'Parametre hatası',
          message: 'Teklif ID\'si gerekli'
        });
      }

      const messages = await chatService.getMessages(quoteId as string, {
        page: Number(page),
        limit: Number(limit)
      });
      
      res.json(messages);
    } catch (error) {
      console.error('Mesaj listeleme hatası:', error);
      res.status(500).json({
        error: 'Mesaj listeleme hatası',
        message: 'Mesajlar listelenirken bir hata oluştu'
      });
    }
  }
);

// Mesaj sil
router.delete('/messages/:id',
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const messageId = req.params.id;
      
      const message = await chatService.getMessageById(messageId);
      
      if (!message) {
        return res.status(404).json({
          error: 'Mesaj bulunamadı',
          message: 'Silinecek mesaj mevcut değil'
        });
      }

      // Yetki kontrolü
      if (message.userId !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          error: 'Yetki hatası',
          message: 'Bu mesajı silme izniniz yok'
        });
      }

      await chatService.deleteMessage(messageId);
      
      res.json({
        message: 'Mesaj başarıyla silindi'
      });
    } catch (error) {
      console.error('Mesaj silme hatası:', error);
      res.status(500).json({
        error: 'Mesaj silme hatası',
        message: 'Mesaj silinirken bir hata oluştu'
      });
    }
  }
);

// Okunmamış mesaj sayısını getir
router.get('/unread',
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const { quoteId } = req.query;
      
      if (!quoteId) {
        return res.status(400).json({
          error: 'Parametre hatası',
          message: 'Teklif ID\'si gerekli'
        });
      }

      const count = await chatService.getUnreadMessageCount(
        userId,
        quoteId as string
      );
      
      res.json({ count });
    } catch (error) {
      console.error('Okunmamış mesaj sayısı hatası:', error);
      res.status(500).json({
        error: 'Okunmamış mesaj sayısı hatası',
        message: 'Okunmamış mesaj sayısı alınırken bir hata oluştu'
      });
    }
  }
);

// Mesajları okundu olarak işaretle
router.post('/messages/read',
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const { quoteId } = req.body;
      
      if (!quoteId) {
        return res.status(400).json({
          error: 'Parametre hatası',
          message: 'Teklif ID\'si gerekli'
        });
      }

      await chatService.markMessagesAsRead(userId, quoteId);
      
      res.json({
        message: 'Mesajlar okundu olarak işaretlendi'
      });
    } catch (error) {
      console.error('Mesaj okundu işaretleme hatası:', error);
      res.status(500).json({
        error: 'Mesaj okundu işaretleme hatası',
        message: 'Mesajlar okundu olarak işaretlenirken bir hata oluştu'
      });
    }
  }
);

export default router; 
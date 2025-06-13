import express from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/optimize';
import { authMiddleware } from '../middleware/auth';
import { fileService } from '../services/file';
import { upload } from '../middleware/upload';

const router = express.Router();

// Dosya yükleme şeması
const uploadFileSchema = z.object({
  type: z.enum(['quote', 'design', 'other']),
  metadata: z.record(z.string()).optional()
});

// Dosya yükle
router.post('/upload',
  authMiddleware,
  upload.single('file'),
  validateRequest(uploadFileSchema),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'Dosya hatası',
          message: 'Dosya yüklenmedi'
        });
      }

      const userId = req.user?.id;
      const { type, metadata } = req.body;
      
      const file = await fileService.saveFile({
        userId,
        type,
        metadata,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      });
      
      res.status(201).json({
        message: 'Dosya başarıyla yüklendi',
        file: {
          id: file.id,
          name: file.originalName,
          type: file.type,
          size: file.size,
          mimeType: file.mimeType,
          createdAt: file.createdAt
        }
      });
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      res.status(500).json({
        error: 'Dosya yükleme hatası',
        message: 'Dosya yüklenirken bir hata oluştu'
      });
    }
  }
);

// Dosya indir
router.get('/:id',
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const fileId = req.params.id;
      
      const file = await fileService.getFileById(fileId);
      
      if (!file) {
        return res.status(404).json({
          error: 'Dosya bulunamadı',
          message: 'İstenen dosya mevcut değil'
        });
      }

      // Yetki kontrolü
      if (file.userId !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          error: 'Yetki hatası',
          message: 'Bu dosyaya erişim izniniz yok'
        });
      }

      res.download(file.path, file.originalName);
    } catch (error) {
      console.error('Dosya indirme hatası:', error);
      res.status(500).json({
        error: 'Dosya indirme hatası',
        message: 'Dosya indirilirken bir hata oluştu'
      });
    }
  }
);

// Dosya sil
router.delete('/:id',
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const fileId = req.params.id;
      
      const file = await fileService.getFileById(fileId);
      
      if (!file) {
        return res.status(404).json({
          error: 'Dosya bulunamadı',
          message: 'Silinecek dosya mevcut değil'
        });
      }

      // Yetki kontrolü
      if (file.userId !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          error: 'Yetki hatası',
          message: 'Bu dosyayı silme izniniz yok'
        });
      }

      await fileService.deleteFile(fileId);
      
      res.json({
        message: 'Dosya başarıyla silindi'
      });
    } catch (error) {
      console.error('Dosya silme hatası:', error);
      res.status(500).json({
        error: 'Dosya silme hatası',
        message: 'Dosya silinirken bir hata oluştu'
      });
    }
  }
);

// Kullanıcının dosyalarını listele
router.get('/',
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const { type, page = 1, limit = 10 } = req.query;
      
      const files = await fileService.getUserFiles(userId, {
        type: type as string,
        page: Number(page),
        limit: Number(limit)
      });
      
      res.json(files);
    } catch (error) {
      console.error('Dosya listeleme hatası:', error);
      res.status(500).json({
        error: 'Dosya listeleme hatası',
        message: 'Dosyalar listelenirken bir hata oluştu'
      });
    }
  }
);

export default router; 
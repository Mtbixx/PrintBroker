import express from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/optimize.js';
import { authenticate } from '../middleware/auth.js';
import { fileUploadService } from '../services/fileUpload.js';
import { fileSecurityService } from '../services/fileSecurity.js';
import { AppError } from '../errors/AppError.js';
import multer from 'multer';
import { storage } from '../storage.js';
import { type InsertFile } from '../shared/schema.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Dosya yükleme şeması (req.body için)
const uploadFileSchema = z.object({
  quoteId: z.string().uuid().optional(),
  type: z.enum(["design", "document", "image", "proof", "other"]).optional().default("other"),
  status: z.enum(["uploading", "processing", "ready", "error", "warning"]).optional().default("uploading"),
  thumbnailPath: z.string().optional(),
  dimensions: z.string().optional(),
  colorProfile: z.string().optional(),
  resolution: z.number().optional(),
  hasTransparency: z.boolean().optional(),
  pageCount: z.number().optional(),
  processingNotes: z.string().optional(),
  downloadCount: z.number().optional(),
  isPublic: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
});

// Dosya güncelleme şeması
const updateFileSchema = z.object({
  status: z.enum(["uploading", "processing", "ready", "error", "warning"]).optional(),
  thumbnailPath: z.string().optional(),
  dimensions: z.string().optional(),
  colorProfile: z.string().optional(),
  resolution: z.number().optional(),
  hasTransparency: z.boolean().optional(),
  pageCount: z.number().optional(),
  processingNotes: z.string().optional(),
  downloadCount: z.number().optional(),
  isPublic: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
});

// Dosya yükle
router.post('/',
  authenticate,
  multer().single('file'),
  validateRequest(uploadFileSchema),
  async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('Kullanıcı kimliği bulunamadı', 400);
      }

      if (!req.file) {
        throw new AppError('Dosya yüklenmedi', 400);
      }

      await fileUploadService.validateFile(req.file);

      const savedFileDetails = await fileUploadService.saveFile(req.file, userId);

      const insertFile: InsertFile = {
        id: uuidv4(),
        filename: savedFileDetails.path.split(/\\|\//).pop() || 'unknown',
        originalName: savedFileDetails.originalName,
        mimeType: savedFileDetails.mimeType,
        size: savedFileDetails.size,
        userId: userId,
        quoteId: req.body.quoteId,
        type: req.body.type || 'other',
        status: req.body.status || 'ready',
        thumbnailPath: req.body.thumbnailPath,
        dimensions: req.body.dimensions,
        colorProfile: req.body.colorProfile,
        resolution: req.body.resolution,
        hasTransparency: req.body.hasTransparency,
        pageCount: req.body.pageCount,
        processingNotes: req.body.processingNotes,
        downloadCount: req.body.downloadCount,
        isPublic: req.body.isPublic,
        metadata: req.body.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newFile = await storage.createFile(insertFile);

      res.status(201).json({
        message: 'Dosya başarıyla yüklendi',
        file: newFile
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

// Kullanıcıya ait dosyaları listele
router.get('/user',
  authenticate,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('Kullanıcı kimliği bulunamadı', 400);
      }
      const files = await storage.getFilesByUser(userId);
      res.json(files);
    } catch (error) {
      console.error('Kullanıcı dosyaları listeleme hatası:', error);
      res.status(500).json({
        error: 'Dosya listeleme hatası',
        message: 'Dosyalar listelenirken bir hata oluştu'
      });
    }
  }
);

// Teklife ait dosyaları listele
router.get('/quote/:quoteId',
  authenticate,
  async (req, res) => {
    try {
      const { quoteId } = req.params;
      const files = await storage.getFilesByQuote(quoteId);
      res.json(files);
    } catch (error) {
      console.error('Teklif dosyaları listeleme hatası:', error);
      res.status(500).json({
        error: 'Dosya listeleme hatası',
        message: 'Dosyalar listelenirken bir hata oluştu'
      });
    }
  }
);

// Dosya detaylarını getir
router.get('/:id',
  authenticate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const file = await storage.getFileById(id);
      if (!file) {
        throw new AppError('Dosya bulunamadı', 404);
      }
      res.json(file);
    } catch (error) {
      console.error('Dosya detay hatası:', error);
      res.status(500).json({
        error: 'Dosya detay hatası',
        message: 'Dosya detayları alınırken bir hata oluştu'
      });
    }
  }
);

// Dosya güncelle
router.put('/:id',
  authenticate,
  validateRequest(updateFileSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedFile = await storage.updateFile(id, updates);
      res.json({
        message: 'Dosya başarıyla güncellendi',
        file: updatedFile
      });
    } catch (error) {
      console.error('Dosya güncelleme hatası:', error);
      res.status(500).json({
        error: 'Dosya güncelleme hatası',
        message: 'Dosya güncellenirken bir hata oluştu'
      });
    }
  }
);

// Dosya sil
router.delete('/:id',
  authenticate,
  async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteFile(id);
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

// Dosya yükle
router.post('/upload',
  authenticate,
  multer().single('file'),
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
      
      const file = await fileUploadService.saveFile(req.file, userId);
      
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
  authenticate,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const fileId = req.params.id;
      
      const file = await fileUploadService.getFileById(fileId);
      
      if (!file) {
        return res.status(404).json({
          error: 'Dosya bulunamadı',
          message: 'İstenen dosya mevcut değil'
        });
      }

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

// Kullanıcının dosyalarını listele
router.get('/',
  authenticate,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const { type, page = 1, limit = 10 } = req.query;
      
      const files = await fileUploadService.getUserFiles(userId, {
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
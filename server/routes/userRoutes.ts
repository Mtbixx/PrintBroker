import { Router, Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { setupAuth, isAuthenticated } from '../replitAuth';
import { z } from 'zod';
import { User, UserRole, AuthRequest } from '../types';
import { AuthenticationError, AuthorizationError, ValidationError, NotFoundError } from '../errors';
import { cacheMiddleware, clearCache } from '../middleware/cache';
import express from 'express';
import { validateRequest } from '../middleware/optimize';
import { authMiddleware } from '../middleware/auth';
import { userService } from '../services/user';

const router = express.Router();

// Admin middleware
const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await new Promise((resolve, reject) => {
      isAuthenticated(req, res, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });

    const userId = req.user?.claims?.sub;
    if (!userId) {
      throw new AuthenticationError();
    }

    const user = await storage.getUser(userId);
    if (!user || user.role !== 'admin') {
      throw new AuthorizationError();
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Kullanıcı kayıt şeması
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'printer', 'customer'] as const),
  companyName: z.string().optional()
});

// Kullanıcı kaydı
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const user = await storage.createUser(validatedData);
    res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError('Geçersiz kayıt bilgileri'));
    } else {
      next(error);
    }
  }
});

// Kullanıcı girişi
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await storage.authenticateUser(email, password);
    res.json(user);
  } catch (error) {
    next(new AuthenticationError('Geçersiz e-posta veya şifre'));
  }
});

// Profil güncelleme şeması
const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional()
});

// Şifre değiştirme şeması
const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6)
});

// Profil bilgilerini getir
router.get('/profile',
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const user = await userService.getUserProfile(userId);
      
      if (!user) {
        return res.status(404).json({
          error: 'Kullanıcı bulunamadı',
          message: 'Profil bilgileri alınamadı'
        });
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
        phone: user.phone,
        address: user.address,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
    } catch (error) {
      console.error('Profil getirme hatası:', error);
      res.status(500).json({
        error: 'Profil hatası',
        message: 'Profil bilgileri alınırken bir hata oluştu'
      });
    }
  }
);

// Profil güncelle
router.put('/profile',
  authMiddleware,
  validateRequest(updateProfileSchema),
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const updates = req.body;
      
      const updatedUser = await userService.updateUserProfile(userId, updates);
      
      if (!updatedUser) {
        return res.status(404).json({
          error: 'Güncelleme hatası',
          message: 'Kullanıcı bulunamadı'
        });
      }

      res.json({
        message: 'Profil başarıyla güncellendi',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          company: updatedUser.company,
          phone: updatedUser.phone,
          address: updatedUser.address,
          role: updatedUser.role,
          updatedAt: updatedUser.updatedAt
        }
      });
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      res.status(500).json({
        error: 'Güncelleme hatası',
        message: 'Profil güncellenirken bir hata oluştu'
      });
    }
  }
);

// Şifre değiştir
router.put('/password',
  authMiddleware,
  validateRequest(changePasswordSchema),
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const { currentPassword, newPassword } = req.body;
      
      const success = await userService.changePassword(
        userId,
        currentPassword,
        newPassword
      );
      
      if (!success) {
        return res.status(400).json({
          error: 'Şifre değiştirme hatası',
          message: 'Mevcut şifre yanlış'
        });
      }

      res.json({
        message: 'Şifre başarıyla değiştirildi'
      });
    } catch (error) {
      console.error('Şifre değiştirme hatası:', error);
      res.status(500).json({
        error: 'Şifre değiştirme hatası',
        message: 'Şifre değiştirilirken bir hata oluştu'
      });
    }
  }
);

// Hesabı sil
router.delete('/profile',
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      
      const success = await userService.deleteUser(userId);
      
      if (!success) {
        return res.status(404).json({
          error: 'Silme hatası',
          message: 'Kullanıcı bulunamadı'
        });
      }

      res.json({
        message: 'Hesap başarıyla silindi'
      });
    } catch (error) {
      console.error('Hesap silme hatası:', error);
      res.status(500).json({
        error: 'Silme hatası',
        message: 'Hesap silinirken bir hata oluştu'
      });
    }
  }
);

// Admin: Tüm kullanıcıları listele
router.get('/admin/users', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await storage.getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

export default router; 
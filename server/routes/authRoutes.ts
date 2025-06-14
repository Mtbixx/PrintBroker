import express from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/optimize.js';
import { jwtService } from '../services/jwt.js';
import { authService } from '../services/auth.js';

const router = express.Router();

// Giriş şeması
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

// Kayıt şeması
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  company: z.string().optional(),
  role: z.enum(['customer', 'printer']).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  taxNumber: z.string().optional()
});

// Giriş
router.post('/login', 
  validateRequest(loginSchema),
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await authService.validateUser(email, password);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Kimlik doğrulama hatası',
          message: 'Geçersiz e-posta veya şifre'
        });
      }

      const tokens = await jwtService.generateTokens(user);
      
      // Kullanıcı rolüne göre yönlendirme URL'si belirle
      const redirectUrl = user.role === 'printer' ? '/printer-dashboard' : '/customer-dashboard';

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        redirectUrl,
        ...tokens
      });
    } catch (error) {
      console.error('Giriş hatası:', error);
      res.status(500).json({
        success: false,
        error: 'Giriş hatası',
        message: 'Giriş işlemi sırasında bir hata oluştu'
      });
    }
  }
);

// Kayıt
router.post('/register',
  validateRequest(registerSchema),
  async (req, res) => {
    try {
      const { email, password, name, company, role, phone, address, city, postalCode, taxNumber } = req.body;
      
      const existingUser = await authService.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Kayıt hatası',
          message: 'Bu e-posta adresi zaten kullanılıyor'
        });
      }

      const user = await authService.createUser({
        email,
        password,
        name,
        company,
        role,
        phone,
        address,
        city,
        postalCode,
        taxNumber
      });

      const tokens = await jwtService.generateTokens(user);
      
      // Kullanıcı rolüne göre yönlendirme URL'si belirle
      const redirectUrl = role === 'printer' ? '/printer-dashboard' : '/customer-dashboard';

      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        redirectUrl,
        ...tokens
      });
    } catch (error) {
      console.error('Kayıt hatası:', error);
      res.status(500).json({
        success: false,
        error: 'Kayıt hatası',
        message: 'Kayıt işlemi sırasında bir hata oluştu'
      });
    }
  }
);

// Token yenileme
router.post('/refresh',
  async (req, res) => {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          error: 'Token hatası',
          message: 'Yenileme token\'ı gerekli'
        });
      }

      const tokens = await jwtService.refreshAccessToken(refreshToken);
      res.json(tokens);
    } catch (error) {
      console.error('Token yenileme hatası:', error);
      res.status(401).json({
        error: 'Token hatası',
        message: 'Geçersiz veya süresi dolmuş token'
      });
    }
  }
);

// Çıkış
router.post('/logout',
  async (req, res) => {
    try {
      const { refreshToken } = req.body;
      
      if (refreshToken) {
        await jwtService.revokeRefreshToken(refreshToken);
      }

      res.json({
        message: 'Başarıyla çıkış yapıldı'
      });
    } catch (error) {
      console.error('Çıkış hatası:', error);
      res.status(500).json({
        error: 'Çıkış hatası',
        message: 'Çıkış işlemi sırasında bir hata oluştu'
      });
    }
  }
);

export default router; 
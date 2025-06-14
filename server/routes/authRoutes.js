import { Router } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.js';
import { jwtService } from '../services/jwt.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

// Kullanıcı girişi
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post('/login', validateRequest(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authService.validateUser(email, password);
    
    if (!user) {
      return res.status(401).json({ message: 'Geçersiz email veya şifre' });
    }

    const tokens = await jwtService.generateTokens(user);
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company
      },
      ...tokens
    });
  } catch (error) {
    next(error);
  }
});

// Kullanıcı kaydı
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  company: z.string().min(2),
  role: z.enum(['admin', 'printer', 'customer'])
});

router.post('/register', validateRequest(registerSchema), async (req, res, next) => {
  try {
    const { email, password, name, company, role } = req.body;
    
    const existingUser = await authService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Bu email adresi zaten kullanımda' });
    }

    const user = await authService.createUser({
      email,
      password,
      name,
      company,
      role
    });

    const tokens = await jwtService.generateTokens(user);
    
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company
      },
      ...tokens
    });
  } catch (error) {
    next(error);
  }
});

// Kullanıcı bilgilerini getir
router.get('/user', authenticate, async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Kullanıcı kimliği bulunamadı' });
    }

    const user = await authService.findUserByEmail(req.user?.email || '');
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      company: user.company
    });
  } catch (error) {
    next(error);
  }
});

// Token yenileme
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token gerekli' });
    }

    const tokens = await jwtService.refreshAccessToken(refreshToken);
    res.json(tokens);
  } catch (error) {
    next(error);
  }
});

// Çıkış yap
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await jwtService.revokeRefreshToken(refreshToken);
    }
    res.json({ message: 'Başarıyla çıkış yapıldı' });
  } catch (error) {
    next(error);
  }
});

export default router; 
import express from 'express';
import { rateLimitService } from '../services/rateLimit.js';
import { compress, optimizeResponse, validateRequest, cacheControl, corsOptions } from '../middleware/optimize.js';
import cors from 'cors';

import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import quoteRoutes from './quoteRoutes.js';
import fileRoutes from './fileRoutes.js';
import chatRoutes from './chatRoutes.js';

// Ana router
const router = express.Router();

// Genel middleware'ler
router.use(compress);
router.use(optimizeResponse());
router.use(cors(corsOptions));

// API versiyonlama
const v1Router = express.Router();

// Auth rotaları
v1Router.use('/auth', rateLimitService.middleware(rateLimitService.profiles.auth), authRoutes);

// Kullanıcı rotaları
v1Router.use('/users', rateLimitService.middleware(rateLimitService.profiles.api), userRoutes);

// Teklif rotaları
v1Router.use('/quotes', rateLimitService.middleware(rateLimitService.profiles.api), quoteRoutes);

// Dosya rotaları
v1Router.use('/files', rateLimitService.middleware(rateLimitService.profiles.upload), fileRoutes);

// Chat rotaları
v1Router.use('/chat', rateLimitService.middleware(rateLimitService.profiles.chat), chatRoutes);

// API dokümantasyonu
v1Router.get('/docs', (req, res) => {
  res.json({
    version: '1.0.0',
    endpoints: {
      auth: {
        login: 'POST /auth/login',
        register: 'POST /auth/register',
        refresh: 'POST /auth/refresh',
        logout: 'POST /auth/logout'
      },
      users: {
        profile: 'GET /users/profile',
        update: 'PUT /users/profile',
        delete: 'DELETE /users/profile'
      },
      quotes: {
        create: 'POST /quotes',
        list: 'GET /quotes',
        get: 'GET /quotes/:id',
        update: 'PUT /quotes/:id',
        delete: 'DELETE /quotes/:id'
      },
      files: {
        upload: 'POST /files/upload',
        download: 'GET /files/:id',
        delete: 'DELETE /files/:id'
      },
      chat: {
        send: 'POST /chat/messages',
        list: 'GET /chat/messages',
        delete: 'DELETE /chat/messages/:id'
      }
    },
    rateLimits: rateLimitService.profiles
  });
});

// Ana router'a v1 router'ı ekle
router.use('/v1', v1Router);

// 404 handler
router.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint bulunamadı',
    message: 'İstenen endpoint mevcut değil'
  });
});

// Genel hata handler'ı
router.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: 'Sunucu hatası',
    message: process.env.NODE_ENV === 'production' 
      ? 'Bir hata oluştu' 
      : err.message
  });
});

export default router; 
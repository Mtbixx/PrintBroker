import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../services/jwt.js';
import { UserRole } from '../types/index.js';
import { redisConfig } from '../config/redis.js';

// Request tipini genişlet
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        email: string;
      };
    }
  }
}

// Kimlik doğrulama middleware'i
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Yetkilendirme başarısız',
        message: 'Bearer token gerekli'
      });
    }

    const token = authHeader.split(' ')[1];
    const payload = jwtService.verifyToken(token);
    
    req.user = {
      id: payload.userId,
      role: payload.role as UserRole,
      email: payload.email
    };
    next();
  } catch (error) {
    if (error instanceof Error) {
      return res.status(401).json({
        error: 'Yetkilendirme başarısız',
        message: error.message
      });
    }
    next(error);
  }
};

// Rol bazlı yetkilendirme
export const authorize = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Yetkilendirme başarısız',
        message: 'Kullanıcı bilgisi bulunamadı'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Erişim reddedildi',
        message: 'Bu işlem için yetkiniz yok'
      });
    }

    next();
  };
};

// Kaynak sahibi kontrolü
export const checkOwnership = (resourceType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Yetkilendirme başarısız',
          message: 'Kullanıcı bilgisi bulunamadı'
        });
      }

      const resourceId = req.params.id;
      if (!resourceId) {
        return res.status(400).json({
          error: 'Geçersiz istek',
          message: 'Kaynak ID gerekli'
        });
      }

      // TODO: Veritabanı bağlantısı kurulduğunda implement edilecek
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Oturum kontrolü
export const checkSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Oturum geçersiz',
        message: 'Lütfen tekrar giriş yapın'
      });
    }

    // Redis'te oturum kontrolü
    const sessionKey = `session:${req.user.id}`;
    const session = await redisConfig.get(sessionKey);

    if (!session) {
      return res.status(401).json({
        error: 'Oturum sonlandı',
        message: 'Lütfen tekrar giriş yapın'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
}; 
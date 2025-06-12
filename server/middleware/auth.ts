import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../services/jwt';

// Request tipini genişlet
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
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
    
    req.user = payload;
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
export const authorize = (...roles: string[]) => {
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

      // Kaynak sahibini kontrol et
      const isOwner = await checkResourceOwnership(resourceType, resourceId, req.user.userId);
      
      if (!isOwner && req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Erişim reddedildi',
          message: 'Bu kaynağa erişim yetkiniz yok'
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Kaynak sahipliği kontrolü
async function checkResourceOwnership(
  resourceType: string,
  resourceId: string,
  userId: string
): Promise<boolean> {
  // Kaynak tipine göre sahiplik kontrolü
  switch (resourceType) {
    case 'quote':
      // Teklif sahipliği kontrolü
      const quote = await dbPool.query(
        'SELECT customer_id FROM quotes WHERE id = $1',
        [resourceId]
      );
      return quote[0]?.customer_id === userId;

    case 'file':
      // Dosya sahipliği kontrolü
      const file = await dbPool.query(
        'SELECT user_id FROM files WHERE id = $1',
        [resourceId]
      );
      return file[0]?.user_id === userId;

    case 'chat':
      // Sohbet odası erişim kontrolü
      const chat = await dbPool.query(
        'SELECT customer_id, printer_id FROM chat_rooms WHERE id = $1',
        [resourceId]
      );
      return chat[0]?.customer_id === userId || chat[0]?.printer_id === userId;

    default:
      return false;
  }
}

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
    const sessionKey = `session:${req.user.userId}`;
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
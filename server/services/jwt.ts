import jwt from 'jsonwebtoken';
import { config } from '../config';
import { redisConfig } from '../config/redis';

interface TokenPayload {
  userId: string;
  role: string;
  email: string;
}

export class JWTService {
  private static instance: JWTService;
  private readonly secret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  private constructor() {
    this.secret = config.jwt.secret;
    this.accessTokenExpiry = config.jwt.accessTokenExpiry;
    this.refreshTokenExpiry = config.jwt.refreshTokenExpiry;
  }

  public static getInstance(): JWTService {
    if (!JWTService.instance) {
      JWTService.instance = new JWTService();
    }
    return JWTService.instance;
  }

  public generateTokens(payload: TokenPayload): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessToken = jwt.sign(payload, this.secret, {
      expiresIn: this.accessTokenExpiry
    });

    const refreshToken = jwt.sign(payload, this.secret, {
      expiresIn: this.refreshTokenExpiry
    });

    // Refresh token'ı Redis'e kaydet
    this.storeRefreshToken(payload.userId, refreshToken);

    return { accessToken, refreshToken };
  }

  public verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.secret) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token süresi doldu');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Geçersiz token');
      }
      throw error;
    }
  }

  public async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      // Refresh token'ı doğrula
      const payload = this.verifyToken(refreshToken);

      // Redis'te refresh token'ı kontrol et
      const storedToken = await this.getRefreshToken(payload.userId);
      if (!storedToken || storedToken !== refreshToken) {
        throw new Error('Geçersiz refresh token');
      }

      // Yeni access token oluştur
      return jwt.sign(payload, this.secret, {
        expiresIn: this.accessTokenExpiry
      });
    } catch (error) {
      throw new Error('Token yenileme başarısız');
    }
  }

  public async revokeRefreshToken(userId: string): Promise<void> {
    await redisConfig.del(`refresh_token:${userId}`);
  }

  private async storeRefreshToken(userId: string, token: string): Promise<void> {
    const expiry = parseInt(this.refreshTokenExpiry);
    await redisConfig.set(`refresh_token:${userId}`, token, expiry);
  }

  private async getRefreshToken(userId: string): Promise<string | null> {
    return redisConfig.get(`refresh_token:${userId}`);
  }

  public decodeToken(token: string): TokenPayload | null {
    try {
      return jwt.decode(token) as TokenPayload;
    } catch {
      return null;
    }
  }

  public isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as { exp: number };
      return decoded.exp < Date.now() / 1000;
    } catch {
      return true;
    }
  }
}

export const jwtService = JWTService.getInstance(); 
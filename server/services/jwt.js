import jwt from 'jsonwebtoken';
import { config } from '../config.js';

class JwtService {
  constructor() {
    if (!config.jwt.secret || !config.jwt.refreshSecret) {
      throw new Error('JWT secret ve refresh secret gerekli');
    }
  }

  generateTokens(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.accessExpiration
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiration
    });

    return { accessToken, refreshToken };
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw new Error('Geçersiz token');
    }
  }

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, config.jwt.refreshSecret);
    } catch (error) {
      throw new Error('Geçersiz refresh token');
    }
  }

  async refreshAccessToken(refreshToken) {
    try {
      const payload = this.verifyRefreshToken(refreshToken);
      
      const accessToken = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.accessExpiration
      });

      return { accessToken };
    } catch (error) {
      throw new Error('Token yenileme başarısız');
    }
  }

  async revokeRefreshToken(token) {
    try {
      // Token'ı doğrula
      this.verifyRefreshToken(token);
      
      // Burada token'ı Redis'te blacklist'e ekleyebilirsiniz
      // Şimdilik sadece doğrulama yapıyoruz
      return true;
    } catch (error) {
      throw new Error('Token iptal edilemedi');
    }
  }
}

export const jwtService = new JwtService(); 
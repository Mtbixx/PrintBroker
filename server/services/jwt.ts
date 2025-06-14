import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { User } from '../types/index.js';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export class JwtService {
  private static instance: JwtService;

  private constructor() {}

  public static getInstance(): JwtService {
    if (!JwtService.instance) {
      JwtService.instance = new JwtService();
    }
    return JwtService.instance;
  }

  public async generateTokens(user: User) {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.accessExpiration
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiration
    });

    return {
      accessToken,
      refreshToken
    };
  }

  public verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as TokenPayload;
    } catch (error) {
      throw new Error('Geçersiz token');
    }
  }

  public verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
    } catch (error) {
      throw new Error('Geçersiz refresh token');
    }
  }
}

export const jwtService = JwtService.getInstance(); 
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt = require('bcrypt');

import { prisma } from '../lib/prisma.js';
import { User, UserRole } from '../types/index.js';
import { AuthError } from '../errors/AppError.js';
import { Request, Response, NextFunction } from 'express';

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Kullanıcı doğrulama
  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user || !user.password) {
        return null;
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return null;
      }

      return user;
    } catch (error) {
      console.error('Kullanıcı doğrulama hatası:', error);
      throw new AuthError('Kullanıcı doğrulama hatası');
    }
  }

  // Kullanıcı oluşturma
  async createUser(userData: {
    email: string;
    password: string;
    name: string;
    company?: string;
    role?: UserRole;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    taxNumber?: string;
  }): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          company: userData.company,
          role: userData.role || 'customer',
          phone: userData.phone,
          address: userData.address,
          city: userData.city,
          postalCode: userData.postalCode,
          taxNumber: userData.taxNumber,
          isActive: true
        }
      });

      return user;
    } catch (error) {
      console.error('Kullanıcı oluşturma hatası:', error);
      throw new AuthError('Kullanıcı oluşturma hatası');
    }
  }

  // E-posta ile kullanıcı bulma
  async findUserByEmail(email: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { email }
      });
    } catch (error) {
      console.error('Kullanıcı bulma hatası:', error);
      throw new AuthError('Kullanıcı bulma hatası');
    }
  }

  // Kullanıcı rolünü güncelleme
  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    try {
      const result = await prisma.user.update({
        where: { id: userId },
        data: { role }
      });

      if (!result) {
        throw new AuthError('Kullanıcı bulunamadı');
      }

      return result;
    } catch (error) {
      console.error('Rol güncelleme hatası:', error);
      throw new AuthError('Rol güncelleme hatası');
    }
  }

  // Şifre güncelleme
  async updatePassword(userId: string, newPassword: string): Promise<void> {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });
    } catch (error) {
      console.error('Şifre güncelleme hatası:', error);
      throw new AuthError('Şifre güncelleme hatası');
    }
  }

  // Kullanıcı silme
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const result = await prisma.user.delete({
        where: { id: userId }
      });

      return !!result;
    } catch (error) {
      console.error('Kullanıcı silme hatası:', error);
      throw new AuthError('Kullanıcı silme hatası');
    }
  }

  // Kullanıcı bilgilerini güncelleme
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const allowedUpdates = ['name', 'company', 'phone', 'address'];
      const updateFields = Object.keys(updates)
        .filter(key => allowedUpdates.includes(key))
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');

      if (!updateFields) {
        throw new AuthError('Geçersiz güncelleme alanları');
      }

      const values = Object.values(updates).filter(value => value !== undefined);
      const result = await prisma.user.update({
        where: { id: userId },
        data: {
          [updateFields]: {
            set: Object.fromEntries(Object.entries(updates).filter(([key, value]) => value !== undefined).map(([key, value]) => [key, value]))
          }
        }
      });

      if (!result) {
        throw new AuthError('Kullanıcı bulunamadı');
      }

      return result;
    } catch (error) {
      console.error('Kullanıcı güncelleme hatası:', error);
      throw new AuthError('Kullanıcı güncelleme hatası');
    }
  }
}

export const authService = AuthService.getInstance(); 
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt = require('bcrypt');

import { prisma } from '../lib/prisma.js';
import { User, UserRole } from '../types/index.js';
import { AppError } from '../errors/AppError.js';

export class UserService {
  private static instance: UserService;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async getUserProfile(userId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User | undefined> {
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      return undefined;
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updates as any, // Prisma'nın User tipi ile Partial<User> arasındaki farkı yönetmek için any kullanıldı.
    });
    return updatedUser;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) {
      throw new AppError('Kullanıcı bulunamadı veya şifresi yok', 404, 'USER_NOT_FOUND');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return false;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });
    return true;
  }

  async deleteUser(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return false;
    }
    await prisma.user.delete({ where: { id: userId } });
    return true;
  }

  async authenticateUser(email: string, passwordReq: string): Promise<User> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      throw new AppError('Geçersiz e-posta veya şifre', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(passwordReq, user.password);
    if (!isMatch) {
      throw new AppError('Geçersiz e-posta veya şifre', 401, 'INVALID_CREDENTIALS');
    }

    return user;
  }
}

export const userService = UserService.getInstance(); 
import { storage } from '../storage.js';
import { User, UserRole } from '../types.js';
import bcrypt from 'bcrypt';
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

  async getUserProfile(userId: string): Promise<User | undefined> {
    return storage.getUser(userId);
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User | undefined> {
    const existingUser = await storage.getUser(userId);
    if (!existingUser) {
      return undefined;
    }
    const updatedUser = await storage.upsertUser({
      ...existingUser,
      ...updates,
      id: userId, // Ensure ID is passed for upsert
    });
    return updatedUser;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = await storage.getUser(userId);
    if (!user || !user.password) {
      throw new AppError('Kullanıcı bulunamadı veya şifresi yok', 404, 'USER_NOT_FOUND');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return false;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await storage.upsertUser({ ...user, password: hashedPassword, id: userId });
    return true;
  }

  async deleteUser(userId: string): Promise<boolean> {
    const user = await storage.getUser(userId);
    if (!user) {
      return false;
    }
    await storage.deleteUser(userId);
    return true;
  }

  async authenticateUser(email: string, passwordReq: string): Promise<User> {
    const user = await storage.getUserByEmail(email);
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
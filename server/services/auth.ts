import bcrypt from 'bcrypt';
import { db } from '../db';
import { User, UserRole } from '../types';
import { AuthError } from '../errors';

export class AuthService {
  // Kullanıcı doğrulama
  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (!user.rows[0]) {
        return null;
      }

      const isValid = await bcrypt.compare(password, user.rows[0].password);
      if (!isValid) {
        return null;
      }

      return user.rows[0];
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
  }): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const result = await db.query(
        `INSERT INTO users (email, password, name, company, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          userData.email,
          hashedPassword,
          userData.name,
          userData.company,
          'user'
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Kullanıcı oluşturma hatası:', error);
      throw new AuthError('Kullanıcı oluşturma hatası');
    }
  }

  // E-posta ile kullanıcı bulma
  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Kullanıcı bulma hatası:', error);
      throw new AuthError('Kullanıcı bulma hatası');
    }
  }

  // Kullanıcı rolünü güncelleme
  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    try {
      const result = await db.query(
        'UPDATE users SET role = $1 WHERE id = $2 RETURNING *',
        [role, userId]
      );

      if (!result.rows[0]) {
        throw new AuthError('Kullanıcı bulunamadı');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Rol güncelleme hatası:', error);
      throw new AuthError('Rol güncelleme hatası');
    }
  }

  // Şifre güncelleme
  async updatePassword(userId: string, newPassword: string): Promise<void> {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await db.query(
        'UPDATE users SET password = $1 WHERE id = $2',
        [hashedPassword, userId]
      );
    } catch (error) {
      console.error('Şifre güncelleme hatası:', error);
      throw new AuthError('Şifre güncelleme hatası');
    }
  }

  // Kullanıcı silme
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const result = await db.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [userId]
      );

      return result.rowCount > 0;
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
      const result = await db.query(
        `UPDATE users SET ${updateFields} WHERE id = $1 RETURNING *`,
        [userId, ...values]
      );

      if (!result.rows[0]) {
        throw new AuthError('Kullanıcı bulunamadı');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Kullanıcı güncelleme hatası:', error);
      throw new AuthError('Kullanıcı güncelleme hatası');
    }
  }
}

export const authService = new AuthService(); 
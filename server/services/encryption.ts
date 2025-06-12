import crypto from 'crypto';
import { config } from '../config';

export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;
  private iv: Buffer;

  constructor() {
    // Şifreleme anahtarı ve IV oluştur
    this.key = crypto.scryptSync(config.encryption.key, 'salt', 32);
    this.iv = crypto.randomBytes(16);
  }

  // Veri şifreleme
  encrypt(data: string): { encrypted: string; iv: string } {
    try {
      const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      return {
        encrypted: encrypted + authTag.toString('hex'),
        iv: this.iv.toString('hex')
      };
    } catch (error) {
      console.error('Şifreleme hatası:', error);
      throw new Error('Veri şifrelenirken bir hata oluştu');
    }
  }

  // Veri şifre çözme
  decrypt(encrypted: string, iv: string): string {
    try {
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.key,
        Buffer.from(iv, 'hex')
      );
      
      const authTag = Buffer.from(encrypted.slice(-32), 'hex');
      const encryptedData = encrypted.slice(0, -32);
      
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Şifre çözme hatası:', error);
      throw new Error('Veri şifresi çözülürken bir hata oluştu');
    }
  }

  // Hassas veri maskeleme
  maskSensitiveData(data: string, type: 'email' | 'phone' | 'creditCard'): string {
    switch (type) {
      case 'email':
        const [username, domain] = data.split('@');
        return `${username.charAt(0)}${'*'.repeat(username.length - 2)}${username.charAt(username.length - 1)}@${domain}`;
      
      case 'phone':
        return data.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
      
      case 'creditCard':
        return data.replace(/(\d{4})\d{8}(\d{4})/, '$1********$2');
      
      default:
        return data;
    }
  }

  // Güvenli hash oluşturma
  createHash(data: string): string {
    return crypto
      .createHash('sha256')
      .update(data + config.encryption.salt)
      .digest('hex');
  }

  // Güvenli token oluşturma
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  // Dosya hash'i oluşturma
  async createFileHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = require('fs').createReadStream(filePath);
      
      stream.on('error', (err: Error) => reject(err));
      stream.on('data', (chunk: Buffer) => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
    });
  }

  // Güvenli parola oluşturma
  generatePassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  }

  // Veri imzalama
  sign(data: string): string {
    const hmac = crypto.createHmac('sha256', this.key);
    hmac.update(data);
    return hmac.digest('hex');
  }

  // İmza doğrulama
  verify(data: string, signature: string): boolean {
    const hmac = crypto.createHmac('sha256', this.key);
    hmac.update(data);
    const calculatedSignature = hmac.digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedSignature)
    );
  }
}

export const encryptionService = new EncryptionService(); 
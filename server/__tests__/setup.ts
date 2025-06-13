import { config } from 'dotenv';
import { resolve } from 'path';

// Test ortamı için .env.test dosyasını yükle
config({ path: resolve(__dirname, '../../.env.test') });

// Test veritabanı bağlantısı için gerekli ayarlar
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

// Test ortamı için global ayarlar
beforeAll(async () => {
  // Test veritabanını hazırla
});

afterAll(async () => {
  // Test veritabanını temizle
});

// Her testten önce çalışacak
beforeEach(async () => {
  // Test veritabanını sıfırla
});

// Her testten sonra çalışacak
afterEach(async () => {
  // Test veritabanını temizle
}); 
import dotenv from 'dotenv';

dotenv.config({ path: '../../../.env' });

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/printbroker_test';
process.env.REDIS_URL = process.env.TEST_REDIS_URL || 'redis://localhost:6379';

jest.setTimeout(10000);

beforeAll(async () => {
  // Test veritabanını hazırla
});

afterAll(async () => {
  // Test veritabanını temizle
});

beforeEach(async () => {
  // Test veritabanını sıfırla
});

afterEach(async () => {
  // Test veritabanını temizle
}); 
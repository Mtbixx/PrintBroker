import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Bağlantıyı test et
prisma.$connect()
  .then(() => {
    console.log('✅ Veritabanı bağlantısı başarılı');
  })
  .catch((error) => {
    console.error('❌ Veritabanı bağlantı hatası:', error);
    process.exit(1);
  });

// Uygulama kapatıldığında bağlantıyı kapat
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  console.log('Veritabanı bağlantısı kapatıldı');
});

export { prisma }; 
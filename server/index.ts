import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('DEBUG: Dotenv yüklendiği dosya yolu:', path.resolve(__dirname, '../../.env'));
console.log('DEBUG: server/index.ts - DATABASE_URL değeri:', process.env.DATABASE_URL);
console.log('DEBUG: server/index.ts - REDIS_URL değeri:', process.env.REDIS_URL);

import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { rateLimitService } from './services/rateLimit.js';
import { jwtService } from './services/jwt.js';
import { errorHandler } from './middleware/errorHandler.js';
import { AppError } from './errors/AppError.js';
import { redisConfig } from './config/redis.js';
import { corsOptions } from './middleware/optimize.js';
import cors from 'cors';
import { loggerService } from './services/logger.js';
import { metricsService } from './services/metrics.js';
import { config } from './config/index.js';

// Rota tanımlamaları
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import quoteRoutes from './routes/quoteRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Güvenlik için helmet kullan
app.use(helmet());

// CORS ayarları
app.use(cors(corsOptions));

// İstek gövdesi ayrıştırma
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP istekleri için loglama
app.use(morgan('dev'));

// Sıkıştırma
app.use(compression());

// Rate limiting middleware'leri
app.use('/api/auth', rateLimitService.middleware(rateLimitService.profiles.auth));
app.use('/api', rateLimitService.middleware(rateLimitService.profiles.api));
app.use('/api/files', rateLimitService.middleware(rateLimitService.profiles.upload));
app.use('/api/chat', rateLimitService.middleware(rateLimitService.profiles.chat));

// Rotaları kullan
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Statik frontend dosyalarını sun
app.use(express.static(path.join(__dirname, './public')));

// Client-side routing için tüm diğer istekleri index.html'e yönlendir
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './public', 'index.html'));
});

// Hata işleyici middleware'i
app.use(errorHandler as express.ErrorRequestHandler);

// Sunucuyu başlat
const PORT = config.server.port || 8080;
const HOST = config.server.host || 'localhost';

app.listen(PORT, HOST, () => {
  loggerService.info(`Server ${HOST}:${PORT} adresinde çalışıyor`);
  loggerService.logSystemEvent('Server Started', { port: PORT, host: HOST });
  console.log(`Server ${HOST}:${PORT} adresinde çalışıyor`);
});

// Uygulama kapatıldığında Redis bağlantısını kapat
process.on('SIGINT', async () => {
  console.log('Sunucu kapatılıyor...');
  await redisConfig.getClient().quit();
  console.log('Redis bağlantısı kapatıldı.');
  process.exit(0);
});

export default app;
import express from 'express';
import { swaggerMiddleware } from './routes/swagger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { securityMiddleware } from './middleware/security';
import { optimizeMiddleware } from './middleware/optimize';
import { monitoringMiddleware } from './middleware/monitoring';
import routes from './routes';

const app = express();

// Temel middleware'ler
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Güvenlik middleware'leri
app.use(securityMiddleware);

// Optimizasyon middleware'leri
app.use(optimizeMiddleware);

// İzleme middleware'leri
app.use(monitoringMiddleware);

// API dokümantasyonu
app.use('/api-docs', ...swaggerMiddleware);

// API rotaları
app.use('/api/v1', routes);

// Hata yönetimi
app.use(notFoundHandler);
app.use(errorHandler);

export default app; 
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PrintBroker API',
      version: '1.0.0',
      description: 'PrintBroker uygulaması için REST API dokümantasyonu',
      contact: {
        name: 'API Destek',
        email: 'destek@printbroker.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Geliştirme Sunucusu'
      },
      {
        url: 'https://api.printbroker.com/v1',
        description: 'Üretim Sunucusu'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Quote: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'accepted', 'rejected'] },
            price: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  },
  apis: ['./server/routes/*.ts']
};

const specs = swaggerJsdoc(options);

export const swaggerMiddleware = [
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'PrintBroker API Dokümantasyonu'
  })
];

// Örnek endpoint dokümantasyonu
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Kullanıcı girişi
 *     description: E-posta ve şifre ile kullanıcı girişi yapar
 *     tags: [Kimlik Doğrulama]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: kullanici@ornek.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Güvenli123!"
 *     responses:
 *       200:
 *         description: Başarılı giriş
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIs..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Geçersiz kimlik bilgileri
 *       429:
 *         description: Çok fazla giriş denemesi
 */

/**
 * @swagger
 * /quotes:
 *   get:
 *     summary: Teklifleri listele
 *     description: Kullanıcının tekliflerini listeler
 *     tags: [Teklifler]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *         description: Teklif durumuna göre filtreleme
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Sayfa numarası
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Sayfa başına teklif sayısı
 *     responses:
 *       200:
 *         description: Başarılı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Quote'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Yetkilendirme hatası
 *       429:
 *         description: İstek sınırı aşıldı
 */ 
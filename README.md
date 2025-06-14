# Print Broker

Print Broker, baskı hizmetleri için bir platformdur. Müşteriler ve baskı firmaları arasında köprü kurarak, baskı işlerinin yönetimini kolaylaştırır.

## Özellikler

- Kullanıcı kimlik doğrulama ve yetkilendirme
- Teklif oluşturma ve yönetimi
- Dosya yükleme ve yönetimi
- Gerçek zamanlı bildirimler
- Çoklu dil desteği

## Kurulum

1. Repoyu klonlayın:
```bash
git clone https://github.com/yourusername/printbroker.git
cd printbroker
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env` dosyasını oluşturun:
```bash
cp .env.example .env
```

4. `.env` dosyasını düzenleyin ve gerekli değişkenleri ayarlayın:
```
DATABASE_URL=postgres://user:password@localhost:5432/printbroker
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
PORT=3000
```

5. Veritabanını oluşturun:
```bash
npm run db:push
```

6. Uygulamayı başlatın:
```bash
# Geliştirme modu
npm run dev

# Üretim modu
npm run build
npm start
```

## API Endpoints

### Kimlik Doğrulama

- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/user` - Kullanıcı bilgilerini getir
- `POST /api/auth/refresh` - Token yenileme
- `POST /api/auth/logout` - Çıkış yap

### Teklifler

- `GET /api/quotes` - Teklifleri listele
- `POST /api/quotes` - Yeni teklif oluştur
- `GET /api/quotes/:id` - Teklif detaylarını getir
- `PUT /api/quotes/:id` - Teklif güncelle
- `DELETE /api/quotes/:id` - Teklif sil

### Dosyalar

- `POST /api/files/upload` - Dosya yükle
- `GET /api/files/:id` - Dosya indir
- `DELETE /api/files/:id` - Dosya sil

## Teknolojiler

- Node.js
- Express.js
- PostgreSQL
- Drizzle ORM
- JWT
- TypeScript
- React
- Tailwind CSS

## Lisans

MIT 
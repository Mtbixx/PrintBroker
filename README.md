# PrintBroker Projesi

## Genel Bakış
Bu proje, matbaa ve baskı işleri için PDF tasarım analizi, dizilim optimizasyonu ve profesyonel iş akışları sunan çok katmanlı bir sistemdir. Node.js (TypeScript) tabanlı backend ve modern bir frontend içerir.

## Klasör Yapısı
- `client/` : React + TypeScript ile yazılmış frontend uygulaması
- `server/` : Express.js tabanlı backend (API, PDF işleme, ödeme, AI servisleri)
- `shared/` : Ortak tipler ve şemalar
- `uploads/`, `attached_assets/` : Dosya yükleme ve varlıklar

## Kurulum
### Node.js Servisleri
```bash
npm install
npm run dev # server ve client için
```

## Çalıştırma
- Frontend: `http://localhost:5173` (veya Vite portu)
- Backend: `http://localhost:3000` (veya belirlediğiniz port)

## Temel Özellikler
- PDF analiz ve kalite kontrol
- Tasarım çıkarımı ve dizilim optimizasyonu
- AI tabanlı analiz ve öneriler
- Ödeme entegrasyonu (PayTR)
- Dosya yükleme ve yönetimi
- Modern UI/UX

## Geliştirme
- Ortak tipler için `shared/` klasörünü kullanın
- Testler ve CI/CD için öneriler README sonunda

## Katkı ve İletişim
Sorularınız veya katkılarınız için lütfen proje sahibiyle iletişime geçin.

---

## İleri Seviye: Test, Versiyonlama, Hata Yönetimi
- Her servis için test altyapısı kurun (örnekler eklenecek)
- API endpointlerinde versiyonlama kullanın (örn. `/api/v1/`)
- Hata yönetimi için merkezi middleware ve kullanıcıya anlamlı mesajlar sağlayın 
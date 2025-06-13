# Node.js base image
FROM node:18-alpine

# Çalışma dizinini ayarla
WORKDIR /app

# Sistem bağımlılıklarını yükle
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    postgresql-client

# Package.json ve package-lock.json dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm ci --only=production

# Uygulama kodunu kopyala
COPY . .

# TypeScript kodunu derle
RUN npm run build

# Gereksiz dosyaları temizle
RUN rm -rf src/ tests/ .git/ .github/ .vscode/ \
    && npm cache clean --force

# Güvenlik için non-root kullanıcı oluştur
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Uygulama portunu aç
EXPOSE 3000

# Uygulamayı başlat
CMD ["npm", "start"] 
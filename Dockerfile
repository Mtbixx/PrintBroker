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
RUN npm install

# Uygulama kodunu kopyala
COPY . .

# Uygulama portunu aç
EXPOSE 3000

# Uygulamayı başlat
CMD ["npm", "run", "dev"] 
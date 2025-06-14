export const config = {
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiration: '15m',
    refreshExpiration: '7d'
  },
  db: {
    url: process.env.DATABASE_URL
  },
  server: {
    port: process.env.PORT || 3000
  }
}; 
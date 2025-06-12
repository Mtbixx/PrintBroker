
const ADMIN_WHITELIST_IPS = [
  '127.0.0.1',
  '::1',
  // Replit IP ranges (güncellenecek)
  '10.0.0.0/8',
  '172.16.0.0/12',
  '192.168.0.0/16'
];

export const adminIPWhitelist = (req: any, res: any, next: any) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  // Development modunda geç
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  // IP whitelist kontrolü
  const isWhitelisted = ADMIN_WHITELIST_IPS.some(allowedIP => {
    if (allowedIP.includes('/')) {
      // CIDR notation check (basit)
      return allowedIP.split('.')[0] === clientIP.split('.')[0];
    }
    return allowedIP === clientIP;
  });

  if (!isWhitelisted) {
    console.warn(`Admin access denied for IP: ${clientIP}`);
    return res.status(403).json({
      message: 'Admin erişim IP kısıtlaması',
      code: 'IP_RESTRICTED'
    });
  }

  next();
};

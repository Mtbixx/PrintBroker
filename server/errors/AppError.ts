// Temel uygulama hatası sınıfı
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Doğrulama hatası
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

// Kimlik doğrulama hatası
export class AuthenticationError extends AppError {
  constructor(message: string) {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

// Yetkilendirme hatası
export class AuthorizationError extends AppError {
  constructor(message: string) {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

// Kaynak bulunamadı hatası
export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND_ERROR');
  }
}

// Çakışma hatası
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

// İstek sınırı hatası
export class RateLimitError extends AppError {
  constructor(message: string) {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

// Sunucu hatası
export class ServerError extends AppError {
  constructor(message: string) {
    super(message, 500, 'SERVER_ERROR', false);
  }
}

// Veritabanı hatası
export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 500, 'DATABASE_ERROR', false);
  }
}

// Redis hatası
export class RedisError extends AppError {
  constructor(message: string) {
    super(message, 500, 'REDIS_ERROR', false);
  }
}

// Dosya işleme hatası
export class FileError extends AppError {
  constructor(message: string) {
    super(message, 500, 'FILE_ERROR', false);
  }
}

// Şifreleme hatası
export class EncryptionError extends AppError {
  constructor(message: string) {
    super(message, 500, 'ENCRYPTION_ERROR', false);
  }
}

// Hata kodları
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  REDIS_ERROR: 'REDIS_ERROR',
  FILE_ERROR: 'FILE_ERROR',
  ENCRYPTION_ERROR: 'ENCRYPTION_ERROR'
} as const;

// Hata mesajları
export const ErrorMessages = {
  [ErrorCodes.VALIDATION_ERROR]: 'Geçersiz veri formatı',
  [ErrorCodes.AUTHENTICATION_ERROR]: 'Kimlik doğrulama başarısız',
  [ErrorCodes.AUTHORIZATION_ERROR]: 'Bu işlem için yetkiniz yok',
  [ErrorCodes.NOT_FOUND_ERROR]: 'İstenen kaynak bulunamadı',
  [ErrorCodes.CONFLICT_ERROR]: 'Kaynak çakışması',
  [ErrorCodes.RATE_LIMIT_ERROR]: 'İstek sınırı aşıldı',
  [ErrorCodes.SERVER_ERROR]: 'Sunucu hatası',
  [ErrorCodes.DATABASE_ERROR]: 'Veritabanı hatası',
  [ErrorCodes.REDIS_ERROR]: 'Redis hatası',
  [ErrorCodes.FILE_ERROR]: 'Dosya işleme hatası',
  [ErrorCodes.ENCRYPTION_ERROR]: 'Şifreleme hatası'
} as const; 
// Temel hata sınıfı
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_SERVER_ERROR'
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Kimlik doğrulama hataları
export class AuthenticationError extends AppError {
  constructor(message: string = 'Kimlik doğrulama başarısız') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Bu işlem için yetkiniz yok') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

// Doğrulama hataları
export class ValidationError extends AppError {
  constructor(message: string = 'Geçersiz veri') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

// Kaynak bulunamadı hataları
export class NotFoundError extends AppError {
  constructor(message: string = 'Kaynak bulunamadı') {
    super(message, 404, 'NOT_FOUND');
  }
}

// Dosya işleme hataları
export class FileProcessingError extends AppError {
  constructor(message: string = 'Dosya işleme hatası') {
    super(message, 400, 'FILE_PROCESSING_ERROR');
  }
}

// İş teklifi hataları
export class QuoteError extends AppError {
  constructor(message: string = 'İş teklifi işlemi başarısız') {
    super(message, 400, 'QUOTE_ERROR');
  }
}

// Hata yönetimi middleware'i
export const errorHandler = (err: Error, req: any, res: any, next: any) => {
  console.error('Hata:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message
      }
    });
  }

  // Bilinmeyen hatalar için
  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Beklenmeyen bir hata oluştu'
    }
  });
}; 
import { Request } from 'express';
import type { Multer } from 'multer';

// Kullanıcı rolleri
export type UserRole = 'admin' | 'printer' | 'customer';

// Kullanıcı tipi
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  company: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  taxNumber?: string;
  password: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// İş teklifi durumları
export type QuoteStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

// İş teklifi tipi
export interface Quote {
  id: string;
  customerId: string;
  printerId: string;
  status: QuoteStatus;
  description: string;
  price?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Matbaa teklifi tipi
export interface PrinterQuote {
  id: string;
  quoteId: string;
  printerId: string;
  price: number;
  deliveryTime: number;
  notes?: string;
  status: QuoteStatus;
  createdAt: Date;
}

// Dosya tipi
export interface File {
  id: string;
  originalName: string;
  path: string;
  mimeType: string;
  size: number;
  userId: string;
  createdAt: Date;
}

// Özel Request tipi
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
  file?: Express.Multer.File;
  body: any;
  params: {
    [key: string]: string;
  };
} 
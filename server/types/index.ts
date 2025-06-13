import { Request } from 'express';
import type { Multer } from 'multer';

// Kullanıcı rolleri
export type UserRole = 'admin' | 'printer' | 'customer';

// Kullanıcı tipi
export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  company?: string;
  phone?: string;
  address?: string;
  password?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// İş teklifi durumları
export type QuoteStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

// İş teklifi tipi
export interface Quote {
  id: string;
  title: string;
  type: string;
  category: string;
  status: QuoteStatus;
  location: string;
  quantity: number;
  totalPrice: number;
  estimatedBudget: number;
  companyInfo: {
    name: string;
    sector: string;
    location: string;
    projectScale: string;
    urgency: string;
  };
  specifications: {
    quantity: number;
    projectType: string;
    material: string;
    printType: string;
    finishing: string;
    colors: string;
    deadline: string;
    qualityLevel: string;
  };
  createdAt: Date;
  deadline: Date;
  userId: string;
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
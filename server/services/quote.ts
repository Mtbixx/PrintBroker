import pkg from 'pg';
const { PoolClient } = pkg;
import { dbPool } from '../db/pool.js';
import { AppError } from '../errors/AppError.js';
import { loggerService } from './logger.js';
import { metricsService } from './metrics.js';

interface QuoteData {
  userId: string;
  title: string;
  description: string;
  specifications: {
    paperSize: string;
    paperType: string;
    colorMode: string;
    quantity: number;
    binding: string;
    deliveryDate: Date;
    specialRequirements?: string;
  };
  attachments: string[];
  budget?: number;
  deadline: Date;
  status: 'draft' | 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  tags: string[];
  companyInfo: {
    name: string;
    taxNumber: string;
    address: string;
    contactPerson: string;
    phone: string;
  };
}

interface QuoteResponse {
  quoteId: string;
  message: string;
  price: number;
  estimatedDeliveryDate: Date;
  terms: string[];
  paymentTerms: {
    method: string;
    dueDate: number;
    advancePayment?: number;
  };
}

export class QuoteService {
  // Teklif oluştur
  async createQuote(data: QuoteData) {
    const client: PoolClient = await dbPool.getClient();
    try {
      await client.query('BEGIN');

      // Teklif oluştur
      const quoteResult = await client.query(
        `INSERT INTO quotes (
          user_id, title, description, specifications, attachments,
          budget, deadline, status, priority, category, tags, company_info
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [
          data.userId,
          data.title,
          data.description,
          data.specifications,
          data.attachments,
          data.budget,
          data.deadline.toISOString(),
          data.status,
          data.priority,
          data.category,
          data.tags,
          data.companyInfo
        ]
      );

      const quote = quoteResult.rows[0];

      // Teklif geçmişi oluştur
      await client.query(
        `INSERT INTO quote_history (quote_id, status, action_by, action_type)
         VALUES ($1, $2, $3, $4)`,
        [quote.id, data.status, data.userId, 'create']
      );

      await client.query('COMMIT');

      return quote;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new AppError('Teklif oluşturulamadı', 500);
    } finally {
      client.release();
    }
  }

  // Teklif güncelle
  async updateQuote(quoteId: string, userId: string, data: Partial<QuoteData>) {
    const client: PoolClient = await dbPool.getClient();
    try {
      await client.query('BEGIN');

      // Teklifi kontrol et
      const quoteResult = await client.query(
        'SELECT * FROM quotes WHERE id = $1 AND user_id = $2',
        [quoteId, userId]
      );

      if (quoteResult.rows.length === 0) {
        throw new AppError('Teklif bulunamadı', 404);
      }

      const quote = quoteResult.rows[0];

      // Güncelleme yap
      const updateResult = await client.query(
        `UPDATE quotes 
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             specifications = COALESCE($3, specifications),
             attachments = COALESCE($4, attachments),
             budget = COALESCE($5, budget),
             deadline = COALESCE($6, deadline),
             status = COALESCE($7, status),
             priority = COALESCE($8, priority),
             category = COALESCE($9, category),
             tags = COALESCE($10, tags),
             company_info = COALESCE($11, company_info),
             updated_at = NOW()
         WHERE id = $12
         RETURNING *`,
        [
          data.title,
          data.description,
          data.specifications,
          data.attachments,
          data.budget,
          data.deadline?.toISOString(),
          data.status,
          data.priority,
          data.category,
          data.tags,
          data.companyInfo,
          quoteId
        ]
      );

      const updatedQuote = updateResult.rows[0];

      // Geçmiş kaydı oluştur
      await client.query(
        `INSERT INTO quote_history (quote_id, status, action_by, action_type)
         VALUES ($1, $2, $3, $4)`,
        [quoteId, updatedQuote.status, userId, 'update']
      );

      await client.query('COMMIT');
      return updatedQuote;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Teklif yanıtı oluştur
  async createQuoteResponse(quoteId: string, data: QuoteResponse) {
    const client: PoolClient = await dbPool.getClient();
    try {
      await client.query('BEGIN');

      // Teklifi kontrol et
      const quoteResult = await client.query(
        'SELECT * FROM quotes WHERE id = $1',
        [quoteId]
      );

      if (quoteResult.rows.length === 0) {
        throw new AppError('Teklif bulunamadı', 404);
      }

      const quote = quoteResult.rows[0];

      // Yanıt oluştur
      const responseResult = await client.query(
        `INSERT INTO quote_responses (
          quote_id, message, price, estimated_delivery_date,
          terms, payment_terms
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
          quoteId,
          data.message,
          data.price,
          data.estimatedDeliveryDate.toISOString(),
          data.terms,
          data.paymentTerms
        ]
      );

      const response = responseResult.rows[0];

      // Teklif durumunu güncelle
      await client.query(
        `UPDATE quotes 
         SET status = 'reviewing',
             updated_at = NOW()
         WHERE id = $1`,
        [quoteId]
      );

      // Geçmiş kaydı oluştur
      await client.query(
        `INSERT INTO quote_history (quote_id, status, action_by, action_type)
         VALUES ($1, $2, $3, $4)`,
        [quoteId, 'reviewing', 'system', 'response']
      );

      await client.query('COMMIT');
      return response;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Teklif listesi
  async listQuotes(userId: string, filters: {
    status?: string;
    category?: string;
    priority?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
  }, pagination: {
    page: number;
    limit: number;
  }) {
    const conditions = ['user_id = $1'];
    const params = [userId];
    let paramIndex = 2;

    if (filters.status) {
      conditions.push(`status = $${paramIndex}`);
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.category) {
      conditions.push(`category = $${paramIndex}`);
      params.push(filters.category);
      paramIndex++;
    }

    if (filters.priority) {
      conditions.push(`priority = $${paramIndex}`);
      params.push(filters.priority);
      paramIndex++;
    }

    if (filters.startDate) {
      conditions.push(`created_at >= $${paramIndex}`);
      params.push(filters.startDate.toISOString());
      paramIndex++;
    }

    if (filters.endDate) {
      conditions.push(`created_at <= $${paramIndex}`);
      params.push(filters.endDate.toISOString());
      paramIndex++;
    }

    if (filters.search) {
      conditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    const offset = (pagination.page - 1) * pagination.limit;

    const result = await dbPool.query(
      `SELECT q.*, 
              COUNT(*) OVER() as total_count,
              (SELECT json_agg(r.*) FROM quote_responses r WHERE r.quote_id = q.id) as responses
       FROM quotes q
       WHERE ${conditions.join(' AND ')}
       ORDER BY 
         CASE 
           WHEN priority = 'urgent' THEN 1
           WHEN priority = 'high' THEN 2
           WHEN priority = 'medium' THEN 3
           WHEN priority = 'low' THEN 4
         END,
         created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, pagination.limit, offset]
    );

    return {
      data: result,
      pagination: {
        total: parseInt(result[0]?.total_count || '0'),
        page: pagination.page,
        limit: pagination.limit,
        pages: Math.ceil(parseInt(result[0]?.total_count || '0') / pagination.limit)
      }
    };
  }

  // Teklif detayı
  async getQuoteDetails(quoteId: string, userId: string) {
    const result = await dbPool.query(
      `SELECT q.*, 
              (SELECT json_agg(r.*) FROM quote_responses r WHERE r.quote_id = q.id) as responses,
              (SELECT json_agg(h.* ORDER BY h.created_at DESC) FROM quote_history h WHERE h.quote_id = q.id) as history
       FROM quotes q
       WHERE q.id = $1 AND q.user_id = $2`,
      [quoteId, userId]
    );

    if (result.length === 0) {
      throw new AppError('Teklif bulunamadı', 404);
    }

    return result[0];
  }

  // Teklif istatistikleri
  async getQuoteStats(userId: string) {
    const result = await dbPool.query(
      `SELECT 
         COUNT(*) as total_quotes,
         COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_quotes,
         COUNT(CASE WHEN status = 'reviewing' THEN 1 END) as reviewing_quotes,
         COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_quotes,
         COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_quotes,
         COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_quotes,
         COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_quotes,
         COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_quotes,
         COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_quotes,
         COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_quotes
       FROM quotes
       WHERE user_id = $1`,
      [userId]
    );

    return result[0];
  }

  // Teklif kategorileri
  async getQuoteCategories() {
    const result = await dbPool.query(
      `SELECT DISTINCT category, COUNT(*) as count
       FROM quotes
       GROUP BY category
       ORDER BY count DESC`,
      []
    );

    return result;
  }

  // Teklif etiketleri
  async getQuoteTags() {
    const result = await dbPool.query(
      `SELECT DISTINCT unnest(tags) as tag, COUNT(*) as count
       FROM quotes
       GROUP BY tag
       ORDER BY count DESC`,
      []
    );

    return result;
  }
}

export const quoteService = new QuoteService(); 
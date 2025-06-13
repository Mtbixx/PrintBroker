import { dbPool } from './pool';

export class QueryBuilder {
  private table: string;
  private conditions: string[] = [];
  private params: any[] = [];
  private orderBy: string[] = [];
  private limit?: number;
  private offset?: number;
  private joins: string[] = [];
  private selectFields: string[] = ['*'];

  constructor(table: string) {
    this.table = table;
  }

  public select(fields: string[]): this {
    this.selectFields = fields;
    return this;
  }

  public where(condition: string, ...params: any[]): this {
    this.conditions.push(condition);
    this.params.push(...params);
    return this;
  }

  public join(table: string, condition: string): this {
    this.joins.push(`JOIN ${table} ON ${condition}`);
    return this;
  }

  public leftJoin(table: string, condition: string): this {
    this.joins.push(`LEFT JOIN ${table} ON ${condition}`);
    return this;
  }

  public orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.orderBy.push(`${field} ${direction}`);
    return this;
  }

  public limit(limit: number): this {
    this.limit = limit;
    return this;
  }

  public offset(offset: number): this {
    this.offset = offset;
    return this;
  }

  public async execute<T = any>(): Promise<T[]> {
    let query = `SELECT ${this.selectFields.join(', ')} FROM ${this.table}`;

    if (this.joins.length > 0) {
      query += ' ' + this.joins.join(' ');
    }

    if (this.conditions.length > 0) {
      query += ' WHERE ' + this.conditions.join(' AND ');
    }

    if (this.orderBy.length > 0) {
      query += ' ORDER BY ' + this.orderBy.join(', ');
    }

    if (this.limit) {
      query += ` LIMIT ${this.limit}`;
    }

    if (this.offset) {
      query += ` OFFSET ${this.offset}`;
    }

    return dbPool.query(query, this.params);
  }

  public async count(): Promise<number> {
    let query = `SELECT COUNT(*) FROM ${this.table}`;

    if (this.joins.length > 0) {
      query += ' ' + this.joins.join(' ');
    }

    if (this.conditions.length > 0) {
      query += ' WHERE ' + this.conditions.join(' AND ');
    }

    const result = await dbPool.query<{ count: string }>(query, this.params);
    return parseInt(result[0].count, 10);
  }

  public async exists(): Promise<boolean> {
    let query = `SELECT EXISTS(SELECT 1 FROM ${this.table}`;

    if (this.joins.length > 0) {
      query += ' ' + this.joins.join(' ');
    }

    if (this.conditions.length > 0) {
      query += ' WHERE ' + this.conditions.join(' AND ');
    }

    query += ')';

    const result = await dbPool.query<{ exists: boolean }>(query, this.params);
    return result[0].exists;
  }
}

// Kullanım örnekleri:
/*
const quotes = await new QueryBuilder('quotes')
  .select(['id', 'title', 'status'])
  .where('status = $1', 'pending')
  .where('created_at > $1', new Date(Date.now() - 24 * 60 * 60 * 1000))
  .join('users', 'quotes.user_id = users.id')
  .orderBy('created_at', 'DESC')
  .limit(10)
  .execute();

const count = await new QueryBuilder('quotes')
  .where('status = $1', 'pending')
  .count();

const exists = await new QueryBuilder('quotes')
  .where('id = $1', quoteId)
  .exists();
*/ 
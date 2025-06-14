import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  company: text('company').notNull(),
  role: text('role', { enum: ['admin', 'printer', 'customer'] }).notNull(),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  postalCode: text('postal_code'),
  taxNumber: text('tax_number'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const quotes = pgTable('quotes', {
  id: text('id').primaryKey().defaultRandom(),
  customerId: text('customer_id').notNull().references(() => users.id),
  printerId: text('printer_id').notNull().references(() => users.id),
  status: text('status', { enum: ['pending', 'accepted', 'rejected', 'completed'] }).notNull().default('pending'),
  description: text('description').notNull(),
  price: text('price'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}); 
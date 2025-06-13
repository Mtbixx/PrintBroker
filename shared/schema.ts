import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  uuid,
  json,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  githubId: varchar("github_id", { length: 256 }).unique(),
  githubUsername: varchar("github_username", { length: 256 }).unique(),
  email: varchar("email", { length: 256 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false),
  image: varchar("image", { length: 256 }),
  role: varchar("role", { length: 256 }).notNull().default("user"),
  password: varchar("password", { length: 256 }),
  creditBalance: decimal("credit_balance", { precision: 10, scale: 2 }).default("0.00"),
  subscriptionStatus: varchar("subscription_status", { enum: ["active", "inactive", "suspended"] }).default("inactive"),
  rating: integer("rating").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projects = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  userId: uuid('user_id').notNull().references(() => users.id),
  designJson: jsonb('design_json'),
  description: text('description'),
  imageUrl: varchar('image_url', { length: 256 }),
  printerId: uuid('printer_id').references(() => printers.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const printers = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  location: varchar('location', { length: 256 }),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  rating: integer('rating').default(0),
  numRatings: integer('num_ratings').default(0),
  pricePerGram: integer('price_per_gram').notNull(),
  isAvailable: boolean('is_available').default(true),
  imageUrl: varchar('image_url', { length: 256 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const quotes = pgTable("quotes", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  status: text("status").notNull().default("pending"),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  specifications: jsonb("specifications").notNull(),
  fileUrls: text("file_urls").array(),
  deadline: timestamp("deadline"),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  selectedQuoteId: uuid("selected_quote_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  customerIdIdx: index("quotes_customer_id_idx").on(table.customerId),
  statusIdx: index("quotes_status_idx").on(table.status),
  typeIdx: index("quotes_type_idx").on(table.type),
  createdAtIdx: index("quotes_created_at_idx").on(table.createdAt),
  deadlineIdx: index("quotes_deadline_idx").on(table.deadline),
  customerStatusIdx: index("quotes_customer_status_idx").on(table.customerId, table.status)
}));

export const printerQuotes = pgTable("printer_quotes", {
  id: uuid("id").primaryKey().defaultRandom(),
  quoteId: uuid("quote_id").notNull().references(() => quotes.id),
  printerId: uuid("printer_id").notNull().references(() => users.id),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  estimatedDays: integer("estimated_days").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  quoteIdIdx: index("printer_quotes_quote_id_idx").on(table.quoteId),
  printerIdIdx: index("printer_quotes_printer_id_idx").on(table.printerId),
  statusIdx: index("printer_quotes_status_idx").on(table.status),
  createdAtIdx: index("printer_quotes_created_at_idx").on(table.createdAt),
  quotePrinterIdx: index("printer_quotes_quote_printer_idx").on(table.quoteId, table.printerId)
}));

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  quoteId: uuid("quote_id").notNull().references(() => quotes.id),
  customerId: uuid("customer_id").notNull().references(() => users.id),
  printerId: uuid("printer_id").notNull().references(() => users.id),
  printerQuoteId: uuid("printer_quote_id").notNull().references(() => printerQuotes.id),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { enum: ["pending_payment", "paid", "in_production", "shipped", "delivered", "cancelled"] }).notNull().default("pending_payment"),
  paymentStatus: varchar("payment_status", { enum: ["pending", "completed", "failed", "refunded"] }).notNull().default("pending"),
  trackingNumber: varchar("tracking_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ratings = pgTable("ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id),
  customerId: uuid("customer_id").notNull().references(() => users.id),
  printerId: uuid("printer_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: varchar("filename").notNull(),
  originalName: varchar("original_name").notNull(),
  mimeType: varchar("mime_type").notNull(),
  size: integer("size").notNull(),
  userId: uuid("user_id").notNull().references(() => users.id),
  quoteId: uuid("quote_id").references(() => quotes.id),
  type: varchar("type", { enum: ["design", "document", "image", "proof", "other"] }).notNull().default("other"),
  status: varchar("status", { enum: ["uploading", "processing", "ready", "error", "warning"] }).notNull().default("uploading"),
  thumbnailPath: varchar("thumbnail_path"),
  dimensions: varchar("dimensions"), // width x height for images

  colorProfile: varchar("color_profile"), // RGB, CMYK, etc.
  resolution: integer("resolution"), // DPI
  hasTransparency: boolean("has_transparency").default(false),
  pageCount: integer("page_count").default(1),
  processingNotes: text("processing_notes"),
  downloadCount: integer("download_count").default(0),
  isPublic: boolean("is_public").default(false),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("files_user_id_idx").on(table.userId),
  mimeTypeIdx: index("files_mime_type_idx").on(table.mimeType),
  createdAtIdx: index("files_created_at_idx").on(table.createdAt),
  userTypeIdx: index("files_user_type_idx").on(table.userId, table.type)
}));

// Contracts table
export const contracts = pgTable("contracts", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projects.id),
  printerId: uuid("printer_id").notNull().references(() => printers.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  customerId: uuid("customer_id").notNull().references(() => users.id),
  status: varchar("status", { length: 256 }).notNull().default("pending"), // pending, accepted, rejected, completed
  contractDetails: jsonb("contract_details"),
  customerSignedAt: timestamp("customer_signed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Chat system tables
export const chatRooms = pgTable("chat_rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  quoteId: uuid("quote_id").notNull().references(() => quotes.id),
  customerId: uuid("customer_id").notNull().references(() => users.id),
  printerId: uuid("printer_id").notNull().references(() => users.id),
  status: text("status").notNull().default("active"),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  quoteIdIdx: index("chat_rooms_quote_id_idx").on(table.quoteId),
  customerIdIdx: index("chat_rooms_customer_id_idx").on(table.customerId),
  printerIdIdx: index("chat_rooms_printer_id_idx").on(table.printerId),
  statusIdx: index("chat_rooms_status_idx").on(table.status),
  createdAtIdx: index("chat_rooms_created_at_idx").on(table.createdAt),
  quoteStatusIdx: index("chat_rooms_quote_status_idx").on(table.quoteId, table.status)
}));

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomId: uuid("room_id").notNull().references(() => chatRooms.id),
  senderId: uuid("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  messageType: varchar("message_type", { enum: ["text", "file", "image"] }).default("text"),
  fileUrl: varchar("file_url"),
  fileName: varchar("file_name"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  roomIdIdx: index("chat_messages_room_id_idx").on(table.roomId),
  senderIdIdx: index("chat_messages_sender_id_idx").on(table.senderId),
  isReadIdx: index("chat_messages_is_read_idx").on(table.isRead),
  createdAtIdx: index("chat_messages_created_at_idx").on(table.createdAt),
  roomCreatedIdx: index("chat_messages_room_created_idx").on(table.roomId, table.createdAt)
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  quotes: many(quotes),
  printerQuotes: many(printerQuotes),
  ordersAsCustomer: many(orders, { relationName: "customerOrders" }),
  ordersAsPrinter: many(orders, { relationName: "printerOrders" }),
  ratingsGiven: many(ratings, { relationName: "customerRatings" }),
  ratingsReceived: many(ratings, { relationName: "printerRatings" }),
  files: many(files),
}));

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  customer: one(users, {
    fields: [quotes.customerId],
    references: [users.id],
  }),
  printerQuotes: many(printerQuotes),
  order: one(orders),
  files: many(files),
}));

export const printerQuotesRelations = relations(printerQuotes, ({ one }) => ({
  quote: one(quotes, {
    fields: [printerQuotes.quoteId],
    references: [quotes.id],
  }),
  printer: one(users, {
    fields: [printerQuotes.printerId],
    references: [users.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  quote: one(quotes, {
    fields: [orders.quoteId],
    references: [quotes.id],
  }),
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id],
    relationName: "customerOrders",
  }),
  printer: one(users, {
    fields: [orders.printerId],
    references: [users.id],
    relationName: "printerOrders",
  }),
  printerQuote: one(printerQuotes, {
    fields: [orders.printerQuoteId],
    references: [printerQuotes.id],
  }),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  order: one(orders, {
    fields: [ratings.orderId],
    references: [orders.id],
  }),
  customer: one(users, {
    fields: [ratings.customerId],
    references: [users.id],
    relationName: "customerRatings",
  }),
  printer: one(users, {
    fields: [ratings.printerId],
    references: [users.id],
    relationName: "printerRatings",
  }),
}));

export const filesRelations = relations(files, ({ one }) => ({
  user: one(users, {
    fields: [files.userId],
    references: [users.id],
  }),
  quote: one(quotes, {
    fields: [files.quoteId],
    references: [quotes.id],
  }),
}));

export const contractsRelations = relations(contracts, ({ one }) => ({
  order: one(orders, {
    fields: [contracts.projectId],
    references: [projects.id],
  }),
  customer: one(users, {
    fields: [contracts.userId],
    references: [users.id],
  }),
  printer: one(users, {
    fields: [contracts.printerId],
    references: [printers.id],
  }),
}));

export const chatRoomsRelations = relations(chatRooms, ({ one, many }) => ({
  quote: one(quotes, {
    fields: [chatRooms.quoteId],
    references: [quotes.id],
  }),
  customer: one(users, {
    fields: [chatRooms.customerId],
    references: [users.id],
  }),
  printer: one(users, {
    fields: [chatRooms.printerId],
    references: [users.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  room: one(chatRooms, {
    fields: [chatMessages.roomId],
    references: [chatRooms.id],
  }),
  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id],
  }),
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertQuoteSchema = createInsertSchema(quotes);
export const selectQuoteSchema = createSelectSchema(quotes);

export const insertPrinterQuoteSchema = createInsertSchema(printerQuotes);
export const selectPrinterQuoteSchema = createSelectSchema(printerQuotes);

export const insertOrderSchema = createInsertSchema(orders);
export const selectOrderSchema = createSelectSchema(orders);

export const insertRatingSchema = createInsertSchema(ratings);
export const selectRatingSchema = createSelectSchema(ratings);

export const insertFileSchema = createInsertSchema(files);
export const selectFileSchema = createSelectSchema(files);

export const insertChatRoomSchema = createInsertSchema(chatRooms);
export const selectChatRoomSchema = createSelectSchema(chatRooms);

export const insertChatMessageSchema = createInsertSchema(chatMessages);
export const selectChatMessageSchema = createSelectSchema(chatMessages);

export const insertContractSchema = createInsertSchema(contracts);
export const selectContractSchema = createSelectSchema(contracts);

// Types for Drizzle ORM
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotes.$inferSelect;
export type InsertPrinterQuote = z.infer<typeof insertPrinterQuoteSchema>;
export type PrinterQuote = typeof printerQuotes.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Rating = typeof ratings.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;
export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;
export type ChatRoom = typeof chatRooms.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contracts.$inferSelect;

// For easier use (new types)
export type NewUser = z.infer<typeof insertUserSchema>;
export type NewQuote = z.infer<typeof insertQuoteSchema>;
export type NewPrinterQuote = z.infer<typeof insertPrinterQuoteSchema>;
export type NewFile = z.infer<typeof insertFileSchema>;
export type NewChatRoom = z.infer<typeof insertChatRoomSchema>;
export type NewChatMessage = z.infer<typeof insertChatMessageSchema>;

export type Project = InferSelectModel<typeof projects>;
export type NewProject = InferInsertModel<typeof projects>;
export type Printer = InferSelectModel<typeof printers>;
export type NewPrinter = InferInsertModel<typeof printers>;
export type Notification = InferSelectModel<typeof notifications>;
export type NewNotification = InferInsertModel<typeof notifications>;

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  type: varchar('type', { length: 256 }).notNull(), // e.g., 'contract_update', 'project_status'
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}); 
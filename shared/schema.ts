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

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
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
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: text("role").notNull().default("customer"),
  creditBalance: decimal("credit_balance", { precision: 10, scale: 2 }).default("0.00"),
  subscriptionStatus: varchar("subscription_status", { enum: ["active", "inactive", "suspended"] }).default("inactive"),
  phone: varchar("phone"),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  companyName: varchar("company_name"),
  companyDescription: text("company_description"),
  companyAddress: text("company_address"),
  companyPhone: varchar("company_phone"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalRatings: integer("total_ratings").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  roleIdx: index("users_role_idx").on(table.role),
  companyNameIdx: index("users_company_name_idx").on(table.companyName),
  createdAtIdx: index("users_created_at_idx").on(table.createdAt)
}));

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => users.id),
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
  id: serial("id").primaryKey(),
  quoteId: integer("quote_id").notNull().references(() => quotes.id),
  printerId: integer("printer_id").notNull().references(() => users.id),
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
  customerId: varchar("customer_id").notNull().references(() => users.id),
  printerId: varchar("printer_id").notNull().references(() => users.id),
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
  customerId: varchar("customer_id").notNull().references(() => users.id),
  printerId: varchar("printer_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  filename: varchar("filename").notNull(),
  originalName: varchar("original_name").notNull(),
  mimeType: varchar("mime_type").notNull(),
  size: integer("size").notNull(),
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  quoteId: uuid("quote_id").references(() => quotes.id),
  fileType: varchar("file_type", { enum: ["design", "document", "image", "proof", "other"] }).notNull().default("other"),
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
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  printerId: varchar("printer_id").notNull().references(() => users.id),
  contractNumber: varchar("contract_number").notNull().unique(),
  title: varchar("title").notNull(),
  description: text("description"),
  terms: text("terms").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { enum: ["draft", "sent", "customer_approved", "printer_approved", "fully_approved", "rejected", "cancelled"] }).notNull().default("draft"),
  customerSignedAt: timestamp("customer_signed_at"),
  printerSignedAt: timestamp("printer_signed_at"),
  customerSignature: text("customer_signature"),
  printerSignature: text("printer_signature"),
  contractPdfPath: varchar("contract_pdf_path"),
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat system tables
export const chatRooms = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  quoteId: integer("quote_id").notNull().references(() => quotes.id),
  customerId: integer("customer_id").notNull().references(() => users.id),
  printerId: integer("printer_id").notNull().references(() => users.id),
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
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull().references(() => chatRooms.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
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
  rating: one(ratings),
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
  uploadedBy: one(users, {
    fields: [files.uploadedBy],
    references: [users.id],
  }),
  quote: one(quotes, {
    fields: [files.quoteId],
    references: [quotes.id],
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
    relationName: "customerChats",
  }),
  printer: one(users, {
    fields: [chatRooms.printerId],
    references: [users.id],
    relationName: "printerChats",
  }),
  messages: many(chatMessages),
}));

export const contractsRelations = relations(contracts, ({ one }) => ({
  order: one(orders, {
    fields: [contracts.orderId],
    references: [orders.id],
  }),
  customer: one(users, {
    fields: [contracts.customerId],
    references: [users.id],
    relationName: "customerContracts",
  }),
  printer: one(users, {
    fields: [contracts.printerId],
    references: [users.id],
    relationName: "printerContracts",
  }),
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertQuoteSchema = createInsertSchema(quotes);
export const selectQuoteSchema = createSelectSchema(quotes);

export const insertPrinterQuoteSchema = createInsertSchema(printerQuotes);
export const selectPrinterQuoteSchema = createSelectSchema(printerQuotes);

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRatingSchema = createInsertSchema(ratings).omit({ id: true, createdAt: true });
export const insertFileSchema = createInsertSchema(files).omit({ id: true, createdAt: true });
export const selectFileSchema = createSelectSchema(files);
export const insertChatRoomSchema = createInsertSchema(chatRooms).omit({ id: true, createdAt: true, updatedAt: true });
export const selectChatRoomSchema = createSelectSchema(chatRooms);
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export const selectChatMessageSchema = createSelectSchema(chatMessages);
export const insertContractSchema = createInsertSchema(contracts).omit({ id: true, createdAt: true, updatedAt: true });

// Types
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

// Tip tanımlamaları
export type NewUser = z.infer<typeof insertUserSchema>;
export type NewQuote = z.infer<typeof insertQuoteSchema>;
export type NewPrinterQuote = z.infer<typeof insertPrinterQuoteSchema>;
export type NewFile = z.infer<typeof insertFileSchema>;
export type NewChatRoom = z.infer<typeof insertChatRoomSchema>;
export type NewChatMessage = z.infer<typeof insertChatMessageSchema>;
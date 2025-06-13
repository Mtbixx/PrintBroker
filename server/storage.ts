import {
  users,
  quotes,
  printerQuotes,
  orders,
  ratings,
  files,
  chatRooms,
  chatMessages,
  contracts,
  type User,
  type UpsertUser,
  type InsertQuote,
  type Quote,
  type InsertPrinterQuote,
  type PrinterQuote,
  type InsertOrder,
  type Order,
  type InsertRating,
  type Rating,
  type InsertFile,
  type File,
  type InsertChatRoom,
  type ChatRoom,
  type InsertChatMessage,
  type ChatMessage,
  type InsertContract,
  type Contract,
} from "../shared/schema.js";
import { db } from "./db.js";
import { eq, desc, and, or, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations 
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: any): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<void>;
  updateUserCreditBalance(id: string, newBalance: string): Promise<void>;
  updateUserSubscription(id: string, status: string): Promise<void>;

  // Quote operations
  createQuote(quote: InsertQuote): Promise<Quote>;
  getQuote(id: string): Promise<Quote | undefined>;
  getQuotesByCustomer(customerId: string): Promise<Quote[]>;
  getQuotesForPrinter(): Promise<Quote[]>;
  updateQuoteStatus(id: string, status: string): Promise<void>;

  // Printer quote operations
  createPrinterQuote(printerQuote: InsertPrinterQuote): Promise<PrinterQuote>;
  getPrinterQuotesByQuote(quoteId: string): Promise<PrinterQuote[]>;
  getPrinterQuotesByPrinter(printerId: string): Promise<PrinterQuote[]>;

  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByCustomer(customerId: string): Promise<Order[]>;
  getOrdersByPrinter(printerId: string): Promise<Order[]>;
  updateOrderStatus(id: string, status: string): Promise<void>;

  // Rating operations
  createRating(rating: InsertRating): Promise<Rating>;
  updatePrinterRating(printerId: string): Promise<void>;

  // File operations
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: string, data: Partial<File>): Promise<File>;
  getFilesByQuote(quoteId: string): Promise<File[]>;
  getFilesByUser(userId: string): Promise<File[]>;
  getDesign(id: string): Promise<File | undefined>;
  getFileById(id: string): Promise<File | undefined>;
  deleteFile(id: string): Promise<void>;
  deleteFilesByUserAndType(userId: string, fileType: "design" | "document" | "image" | "proof" | "other"): Promise<number>;

  // Admin operations
  getAllUsers(): Promise<User[]>;
  getUserStats(): Promise<any>;
  getRecentActivity(): Promise<any[]>;
  getAllQuotes(): Promise<any[]>;
  getAllOrders(): Promise<any[]>;
  deleteUser(userId: string): Promise<void>;

  // Chat operations
  createChatRoom(chatRoom: InsertChatRoom): Promise<ChatRoom>;
  getChatRoom(id: string): Promise<ChatRoom | undefined>;
  getChatRoomByQuote(quoteId: string, customerId: string, printerId: string): Promise<ChatRoom | undefined>;
  getChatRoomsByUser(userId: string): Promise<ChatRoom[]>;

  sendMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getMessages(roomId: string, limit?: number): Promise<ChatMessage[]>;
  markMessagesAsRead(roomId: string, userId: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;

  // Contract operations
  createContract(contract: InsertContract): Promise<Contract>;
  getContract(id: string): Promise<Contract | undefined>;
  getContractsByCustomer(customerId: string): Promise<Contract[]>;
  getContractsByPrinter(printerId: string): Promise<Contract[]>;
  updateContractStatus(id: string, status: string): Promise<void>;
  updateContract(id: string, updateData: Partial<Contract>): Promise<void>;
  signContract(id: string, userId: string, signature: string): Promise<void>;

  createNotification(notification: Notification): void;
  getNotifications(): Notification[];
  markNotificationAsRead(id: string): void;
}

export class DatabaseStorage implements IStorage {
  // User operations 
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: any): Promise<User> {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const [user] = await db
      .insert(users)
      .values({
        id: userId,
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'customer',
        phone: userData.phone,
        companyName: userData.company,
        companyAddress: userData.address,
        profileImageUrl: userData.profileImageUrl
      })
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        role: role as any,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id));
  }

  async updateUserCreditBalance(userId: string, newBalance: string): Promise<void> {
    console.log(`💳 Updating credit balance for user ${userId}: ${newBalance}₺`);

    await db.update(users)
      .set({ 
        creditBalance: newBalance,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    // Verify the update
    const updatedUser = await this.getUser(userId);
    console.log(`✅ Credit balance updated successfully. New balance: ${updatedUser?.creditBalance}₺`);
  }

  async updateUserSubscription(userId: string, status: 'active' | 'inactive' | 'suspended'): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month from now

    await db.update(users)
      .set({ 
        subscriptionStatus: status,
        subscriptionExpiresAt: expiresAt,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Quote operations
  async createQuote(quote: InsertQuote): Promise<Quote> {
    const [newQuote] = await db.insert(quotes).values(quote).returning();
    return newQuote;
  }

  async getQuote(id: string): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote;
  }

  async getQuotesByCustomer(customerId: string): Promise<Quote[]> {
    return await db
      .select()
      .from(quotes)
      .where(eq(quotes.customerId, customerId))
      .orderBy(desc(quotes.createdAt));
  }

  async getQuotesForPrinter(): Promise<Quote[]> {
    return await db
      .select()
      .from(quotes)
      .where(eq(quotes.status, "pending"))
      .orderBy(desc(quotes.createdAt));
  }

  async updateQuoteStatus(id: string, status: string): Promise<void> {
    await db
      .update(quotes)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(quotes.id, id));
  }

  // Printer quote operations
  async createPrinterQuote(printerQuote: InsertPrinterQuote): Promise<PrinterQuote> {
    const [newPrinterQuote] = await db.insert(printerQuotes).values(printerQuote).returning();
    return newPrinterQuote;
  }

  async getPrinterQuotesByQuote(quoteId: string): Promise<PrinterQuote[]> {
    return await db
      .select()
      .from(printerQuotes)
      .where(eq(printerQuotes.quoteId, quoteId))
      .orderBy(desc(printerQuotes.createdAt));
  }

  async getPrinterQuotesByPrinter(printerId: string): Promise<PrinterQuote[]> {
    return await db
      .select()
      .from(printerQuotes)
      .where(eq(printerQuotes.printerId, printerId))
      .orderBy(desc(printerQuotes.createdAt));
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrdersByPrinter(printerId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.printerId, printerId))
      .orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(id: string, status: string): Promise<void> {
    await db
      .update(orders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(orders.id, id));
  }

  // Rating operations
  async createRating(rating: InsertRating): Promise<Rating> {
    const [newRating] = await db.insert(ratings).values(rating).returning();
    return newRating;
  }

  async updatePrinterRating(printerId: string): Promise<void> {
    const result = await db.select({
      avgRating: sql<number>`AVG(${ratings.rating})`,
      totalRatings: sql<number>`COUNT(${ratings.id})`,
    })
    .from(ratings)
    .where(eq(ratings.printerId, printerId));

    const { avgRating, totalRatings } = result[0];

    await db.update(users)
      .set({
        rating: avgRating ? avgRating.toFixed(2) : "0.00",
        totalRatings: totalRatings || 0,
        updatedAt: new Date()
      })
      .where(eq(users.id, printerId));
  }

  // File operations
  async createFile(fileData: InsertFile): Promise<File> {
    const [newFile] = await db.insert(files).values(fileData).returning();
    return newFile;
  }

  async updateFile(id: string, data: Partial<File>): Promise<File> {
    const [updatedFile] = await db.update(files).set(data).where(eq(files.id, id)).returning();
    return updatedFile;
  }

  async getFilesByQuote(quoteId: string): Promise<File[]> {
    return await db
      .select()
      .from(files)
      .where(eq(files.quoteId, quoteId))
      .orderBy(desc(files.createdAt));
  }

  async getFilesByUser(userId: string): Promise<File[]> {
    return await db
      .select()
      .from(files)
      .where(eq(files.userId, userId))
      .orderBy(desc(files.createdAt));
  }

  async getFileById(id: string): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file;
  }

  async getDesign(id: string): Promise<File | undefined> {
    // Assuming 'design' is a specific file type or has a special designation
    const [design] = await db.select().from(files).where(and(eq(files.id, id), eq(files.type, 'design')));
    return design;
  }

  async deleteFile(id: string): Promise<void> {
    await db.delete(files).where(eq(files.id, id));
  }

  async deleteFilesByUserAndType(userId: string, fileType: "design" | "document" | "image" | "proof" | "other"): Promise<number> {
    const result = await db.delete(files).where(and(eq(files.userId, userId), eq(files.type, fileType))).returning({ id: files.id });
    return result.length;
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUserStats(): Promise<any> {
    const totalUsers = await db.select({
      count: sql<number>`count(*)`,
    }).from(users);
    const totalQuotes = await db.select({
      count: sql<number>`count(*)`,
    }).from(quotes);
    const totalOrders = await db.select({
      count: sql<number>`count(*)`,
    }).from(orders);
    const totalRevenue = await db.select({
      sum: sql<number>`sum(${orders.totalAmount})`,
    }).from(orders).where(eq(orders.paymentStatus, 'completed'));

    return {
      totalUsers: totalUsers[0].count,
      totalQuotes: totalQuotes[0].count,
      totalOrders: totalOrders[0].count,
      totalRevenue: totalRevenue[0].sum || 0,
    };
  }

  async getRecentActivity(): Promise<any[]> {
    // This is a simplified example, you might want to fetch from multiple tables
    const recentQuotes = await db.select().from(quotes).orderBy(desc(quotes.createdAt)).limit(5);
    const recentOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5);
    return [...recentQuotes, ...recentOrders].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getAllQuotes(): Promise<any[]> {
    return await db.select().from(quotes).orderBy(desc(quotes.createdAt));
  }

  async getAllOrders(): Promise<any[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async deleteUser(userId: string): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }

  // Chat operations
  async createChatRoom(chatRoom: InsertChatRoom): Promise<ChatRoom> {
    const [newChatRoom] = await db.insert(chatRooms).values(chatRoom).returning();
    return newChatRoom;
  }

  async getChatRoom(id: string): Promise<ChatRoom | undefined> {
    const [chatRoom] = await db.select().from(chatRooms).where(eq(chatRooms.id, id));
    return chatRoom;
  }

  async getChatRoomByQuote(quoteId: string, customerId: string, printerId: string): Promise<ChatRoom | undefined> {
    const [chatRoom] = await db.select().from(chatRooms)
      .where(and(eq(chatRooms.quoteId, quoteId), eq(chatRooms.customerId, customerId), eq(chatRooms.printerId, printerId)));
    return chatRoom;
  }

  async getChatRoomsByUser(userId: string): Promise<ChatRoom[]> {
    return await db.select().from(chatRooms)
      .where(or(eq(chatRooms.customerId, userId), eq(chatRooms.printerId, userId)))
      .orderBy(desc(chatRooms.lastMessageAt));
  }

  async sendMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    await db.update(chatRooms).set({ lastMessageAt: new Date() }).where(eq(chatRooms.id, message.roomId));
    return newMessage;
  }

  async getMessages(roomId: string, limit: number = 50): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages).where(eq(chatMessages.roomId, roomId)).orderBy(desc(chatMessages.createdAt)).limit(limit);
  }

  async markMessagesAsRead(roomId: string, userId: string): Promise<void> {
    await db.update(chatMessages).set({ isRead: true }).where(and(eq(chatMessages.roomId, roomId), eq(chatMessages.senderId, userId), eq(chatMessages.isRead, false)));
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const result = await db.select({
      count: sql<number>`count(*)`,
    })
    .from(chatMessages)
    .leftJoin(chatRooms, eq(chatMessages.roomId, chatRooms.id))
    .where(and(eq(chatRooms.customerId, userId), eq(chatMessages.isRead, false), eq(chatMessages.senderId, chatRooms.printerId)));

    return result[0].count || 0;
  }

  // Contract operations
  async createContract(contract: InsertContract): Promise<Contract> {
    const [newContract] = await db.insert(contracts).values(contract).returning();
    return newContract;
  }

  async getContract(id: string): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
    return contract;
  }

  async getContractsByCustomer(customerId: string): Promise<Contract[]> {
    return await db.select().from(contracts).where(eq(contracts.customerId, customerId)).orderBy(desc(contracts.createdAt));
  }

  async getContractsByPrinter(printerId: string): Promise<Contract[]> {
    return await db.select().from(contracts).where(eq(contracts.printerId, printerId)).orderBy(desc(contracts.createdAt));
  }

  async updateContractStatus(id: string, status: string): Promise<void> {
    await db.update(contracts).set({ status: status as any, updatedAt: new Date() }).where(eq(contracts.id, id));
  }

  async updateContract(id: string, updateData: Partial<Contract>): Promise<void> {
    await db.update(contracts).set(updateData).where(eq(contracts.id, id));
  }

  async signContract(id: string, userId: string, signature: string): Promise<void> {
    const contract = await this.getContract(id);
    if (!contract) throw new Error("Contract not found.");

    if (contract.customerId === userId) {
      await db.update(contracts).set({ customerSignedAt: new Date(), customerSignature: signature }).where(eq(contracts.id, id));
    } else if (contract.printerId === userId) {
      await db.update(contracts).set({ printerSignedAt: new Date(), printerSignature: signature }).where(eq(contracts.id, id));
    } else {
      throw new Error("User is not authorized to sign this contract.");
    }

    // Check if both parties have signed, then update status to fully_approved
    const updatedContract = await this.getContract(id);
    if (updatedContract?.customerSignedAt && updatedContract?.printerSignedAt) {
      await this.updateContractStatus(id, "fully_approved");
    }
  }

  createNotification(notification: Notification): void {
    const notifications = getStoredNotifications();
    notifications.push(notification);
    storeNotifications(notifications);
  }

  getNotifications(): Notification[] {
    return getStoredNotifications();
  }

  markNotificationAsRead(id: string): void {
    const notifications = getStoredNotifications();
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications[index].isRead = true;
      storeNotifications(notifications);
    }
  }

  private getStoredNotifications(): Notification[] {
    const stored = sessionStorage.getItem('notifications');
    return stored ? JSON.parse(stored) : [];
  }

  private storeNotifications(notifications: Notification[]): void {
    sessionStorage.setItem('notifications', JSON.stringify(notifications));
  }
}
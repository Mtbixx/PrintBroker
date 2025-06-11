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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
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

  // Admin operations
  getAllUsers(): Promise<User[]>;
  getUserStats(): Promise<any>;
  getRecentActivity(): Promise<any[]>;

  // Design operations
  saveDesignGeneration(data: {
    userId: string;
    prompt: string;
    options: any;
    result: any;
    createdAt: Date;
  }): Promise<any>; // Replace any with a more specific type

  getDesignHistory(userId: string, options: { page: number; limit: number }): Promise<{
    designs: any[]; // Replace any with a more specific type
    total: number;
    page: number;
    totalPages: number;
  }>;

  getDesignTemplates(): Promise<any[]>; // Replace any with a more specific type

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
  signContract(id: string, userId: string, signature: string): Promise<void>;

  createUser(userData: any): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
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
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id));
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
    await this.updatePrinterRating(rating.printerId);
    return newRating;
  }

  async updatePrinterRating(printerId: string): Promise<void> {
    const [result] = await db
      .select({
        avgRating: sql<number>`avg(${ratings.rating})`,
        totalRatings: sql<number>`count(${ratings.rating})`,
      })
      .from(ratings)
      .where(eq(ratings.printerId, printerId));

    if (result) {
      await db
        .update(users)
        .set({
          rating: result.avgRating.toString(),
          totalRatings: result.totalRatings,
          updatedAt: new Date(),
        })
        .where(eq(users.id, printerId));
    }
  }

  // File operations
  async createFile(file: InsertFile): Promise<File> {
    const [newFile] = await db.insert(files).values(file).returning();
    return newFile;
  }

  async updateFile(id: string, data: Partial<File>): Promise<File> {
    const [updatedFile] = await db
      .update(files)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(files.id, id))
      .returning();
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
      .where(eq(files.uploadedBy, userId))
      .orderBy(desc(files.createdAt));
  }

  async getFileById(id: string): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file;
  }

  async getDesign(id: string): Promise<File | undefined> {
    const [design] = await db.select().from(files).where(eq(files.id, id));
    return design;
  }

  async deleteFile(id: string): Promise<void> {
    await db.delete(files).where(eq(files.id, id));
  }

  async deleteFilesByUserAndType(userId: string, fileType: string): Promise<number> {
    const result = await db
      .delete(files)
      .where(
        sql`${files.uploadedBy} = ${userId} AND ${files.fileType} = ${fileType}`
      )
      .returning({ id: files.id });
    return result.length;
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUserStats(): Promise<any> {
    const [customerCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, "customer"));

    const [printerCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, "printer"));

    const [quoteCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(quotes);

    const [orderCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders);

    return {
      customers: customerCount?.count || 0,
      printers: printerCount?.count || 0,
      quotes: quoteCount?.count || 0,
      orders: orderCount?.count || 0,
    };
  }

  async getRecentActivity(): Promise<any[]> {
    const recentQuotes = await db
      .select({
        id: quotes.id,
        type: sql<string>`'quote'`,
        description: quotes.title,
        createdAt: quotes.createdAt,
      })
      .from(quotes)
      .orderBy(desc(quotes.createdAt))
      .limit(5);

    const recentOrders = await db
      .select({
        id: orders.id,
        type: sql<string>`'order'`,
        description: sql<string>`'Order ' || ${orders.id}`,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(5);

    return [...recentQuotes, ...recentOrders]
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 10);
  }

  async saveDesignGeneration(data: {
    userId: string;
    prompt: string;
    options: any;
    result: any;
    createdAt: Date;
  }): Promise<any> {
    try {
      // Get existing designs for this user
      const existingDesigns = await this.getStoredDesigns(data.userId);
      console.log('Saving new design:', data.result.generationId || 'unknown-id', 'for user:', data.userId);

      const designEntry = {
        id: data.result.generationId || (await import('crypto')).randomUUID(),
        userId: data.userId,
        prompt: data.prompt,
        options: data.options,
        result: data.result,
        createdAt: data.createdAt.toISOString(),
        url: data.result.url || (data.result.data && data.result.data[0] && data.result.data[0].url),
        metadata: data.result.metadata || {}
      };

      // Add new design to the beginning of array
      const allDesigns = [...existingDesigns, designEntry];

      // Store all designs
      await this.storeDesigns(allDesigns);

      console.log('Design saved successfully. Total designs:', allDesigns.length);

      return designEntry;
    } catch (error) {
      console.error('Error saving design generation:', error);
      throw error;
    }
  }

  async getDesignHistory(userId: string, options: { page: number; limit: number }): Promise<any> {
    try {
      const designs = await this.getStoredDesigns(userId);

      // Sort by creation date (newest first)
      const sortedDesigns = designs.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Pagination
      const startIndex = (options.page - 1) * options.limit;
      const endIndex = startIndex + options.limit;
      const paginatedDesigns = sortedDesigns.slice(startIndex, endIndex);

      return {
        designs: paginatedDesigns,
        pagination: {
          page: options.page,
          limit: options.limit,
          total: sortedDesigns.length,
          pages: Math.ceil(sortedDesigns.length / options.limit)
        }
      };
    } catch (error) {
      console.error('Error fetching design history:', error);
      return {
        designs: [],
        pagination: {
          page: options.page,
          limit: options.limit,
          total: 0,
          pages: 0
        }
      };
    }
  }

  async getDesignTemplates() {
    return [
      {
        id: '1',
        name: 'Logo Tasarımı',
        prompt: 'Modern ve minimal logo tasarımı, {company_name} için profesyonel görünüm',
        category: 'logo',
        thumbnail: '/api/files/template-logo.jpg'
      },
      {
        id: '2',
        name: 'Etiket Tasarımı',
        prompt: 'Ürün etiketi tasarımı, {product_name} için çekici ve bilgilendirici',
        category: 'label',
        thumbnail: '/api/files/template-label.jpg'
      },
      {
        id: '3',
        name: 'Kartvizit Tasarımı',
        prompt: 'Profesyonel kartvizit tasarımı, {company_name} için kurumsal kimlik',
        category: 'business_card',
        thumbnail: '/api/files/template-card.jpg'
      },
      {
        id: '4',
        name: 'Broşür Kapağı',
        prompt: 'Çekici broşür kapağı tasarımı, {service_name} için pazarlama materyali',
        category: 'brochure',
        thumbnail: '/api/files/template-brochure.jpg'
      },
      {
        id: '5',
        name: 'Poster Tasarımı',
        prompt: 'Etkileyici poster tasarımı, {event_name} için göz alıcı reklam',
        category: 'poster',
        thumbnail: '/api/files/template-poster.jpg'
      }
    ];
  }

  private async getStoredDesigns(userId: string): Promise<any[]> {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const designsPath = path.join(process.cwd(), 'design-history.json');

      if (fs.existsSync(designsPath)) {
        const data = fs.readFileSync(designsPath, 'utf8');
        let allDesigns = JSON.parse(data);

        // Ensure allDesigns is an array
        if (!Array.isArray(allDesigns)) {
          console.warn('Design history file corrupted, resetting to empty array');
          allDesigns = [];
        }

        return allDesigns.filter((design: any) => design.userId === userId) || [];
      }
      return [];
    } catch (error) {
      console.error('Error reading designs:', error);
      return [];
    }
  }

  private async storeDesigns(designs: any[]): Promise<void> {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const designsPath = path.join(process.cwd(), 'design-history.json');

      fs.writeFileSync(designsPath, JSON.stringify(designs, null, 2));
    } catch (error) {
      console.error('Error storing designs:', error);
    }
  }

  // Chat operations
  async createChatRoom(chatRoom: InsertChatRoom): Promise<ChatRoom> {
    const [room] = await db
      .insert(chatRooms)
      .values(chatRoom)
      .returning();
    return room;
  }

  async getChatRoom(id: string): Promise<ChatRoom | undefined> {
    const [room] = await db
      .select()
      .from(chatRooms)
      .where(eq(chatRooms.id, id));
    return room;
  }

  async getChatRoomByQuote(quoteId: string, customerId: string, printerId: string): Promise<ChatRoom | undefined> {
    const [room] = await db
      .select()
      .from(chatRooms)
      .where(
        and(
          eq(chatRooms.quoteId, quoteId),
          eq(chatRooms.customerId, customerId),
          eq(chatRooms.printerId, printerId)
        )
      );
    return room;
  }

  async getChatRoomsByUser(userId: string): Promise<ChatRoom[]> {
    const rooms = await db
      .select()
      .from(chatRooms)
      .where(
        or(
          eq(chatRooms.customerId, userId),
          eq(chatRooms.printerId, userId)
        )
      )
      .orderBy(desc(chatRooms.lastMessageAt));
    return rooms;
  }

  async sendMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();

    // Update room's last message timestamp
    await db
      .update(chatRooms)
      .set({ 
        lastMessageAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(chatRooms.id, message.roomId));

    return newMessage;
  }

  async getMessages(roomId: string, limit: number = 50): Promise<ChatMessage[]> {
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);

    return messages.reverse(); // Return in chronological order
  }

  async markMessagesAsRead(roomId: string, userId: string): Promise<void> {
    await db
      .update(chatMessages)
      .set({ isRead: true })
      .where(
        and(
          eq(chatMessages.roomId, roomId),
          sql`${chatMessages.senderId} != ${userId}`,
          eq(chatMessages.isRead, false)
        )
      );
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const userRooms = await db
      .select({ id: chatRooms.id })
      .from(chatRooms)
      .where(
        or(
          eq(chatRooms.customerId, userId),
          eq(chatRooms.printerId, userId)
        )
      );

    const roomIds = userRooms.map(room => room.id);

    if (roomIds.length === 0) return 0;

    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(chatMessages)
      .where(
        and(
          sql`${chatMessages.roomId} = ANY(${roomIds})`,
          sql`${chatMessages.senderId} != ${userId}`,
          eq(chatMessages.isRead, false)
        )
      );

    return result?.count || 0;
  }

  // Contract operations
  async createContract(contract: InsertContract): Promise<Contract> {
    const [newContract] = await db.insert(contracts).values(contract).returning();
    return newContract;
  }

  async getContract(id: string): Promise<Contract | undefined> {
    const [contract] = await db
      .select()
      .from(contracts)
      .where(eq(contracts.id, id));
    return contract;
  }

  async getContractsByCustomer(customerId: string): Promise<Contract[]> {
    return await db
      .select()
      .from(contracts)
      .where(eq(contracts.customerId, customerId))
      .orderBy(desc(contracts.createdAt));
  }

  async getContractsByPrinter(printerId: string): Promise<Contract[]> {
    return await db
      .select()
      .from(contracts)
      .where(eq(contracts.printerId, printerId))
      .orderBy(desc(contracts.createdAt));
  }

  async updateContractStatus(id: string, status: string): Promise<void> {
    await db
      .update(contracts)
      .set({ 
        status: status as any,
        updatedAt: new Date()
      })
      .where(eq(contracts.id, id));
  }

  async updateContract(id: string, updateData: Partial<Contract>): Promise<void> {
    await db
      .update(contracts)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(contracts.id, id));
  }

  async signContract(id: string, userId: string, signature: string): Promise<void> {
    const contract = await this.getContract(id);
    if (!contract) return;

    const updateData: any = { updatedAt: new Date() };

    if (contract.customerId === userId) {
      updateData.customerSignature = signature;
      updateData.customerSignedAt = new Date();
      if (contract.printerSignedAt) {
        updateData.status = 'fully_approved';
      } else {
        updateData.status = 'customer_approved';
      }
    } else if (contract.printerId === userId) {
      updateData.printerSignature = signature;
      updateData.printerSignedAt = new Date();
      if (contract.customerSignedAt) {
        updateData.status = 'fully_approved';
      } else {
        updateData.status = 'printer_approved';
      }
    }

    await db
      .update(contracts)
      .set(updateData)
      .where(eq(contracts.id, id));
  }

  // Notifications
  async createNotification(notification: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    isRead: boolean;
    createdAt: Date;
  }): Promise<any> {
    // Store in memory for now - in production this would be in database
    const notifications = this.getStoredNotifications();
    const newNotification = {
      id: (await import('crypto')).randomUUID(),
      ...notification
    };
    notifications.push(newNotification);
    this.storeNotifications(notifications);
    return newNotification;
  }

  async getNotifications(userId: string): Promise<any[]> {
    const notifications = this.getStoredNotifications();
    return notifications
      .filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50); // Last 50 notifications
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    const notifications = this.getStoredNotifications();
    const notification = notifications.find(n => n.id === notificationId && n.userId === userId);
    if (notification) {
      notification.isRead = true;
      this.storeNotifications(notifications);
    }
  }

  private getStoredNotifications(): any[] {
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'notifications.json');
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
      return [];
    } catch {
      return [];
    }
  }

  private storeNotifications(notifications: any[]) {
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'notifications.json');
      fs.writeFileSync(filePath, JSON.stringify(notifications, null, 2));
    } catch (error) {
      console.error('Error storing notifications:', error);
    }
  }

  // Enhanced design management
  async saveDesignGeneration(data: {
    userId: string;
    prompt: string;
    options: any;
    result: any;
    createdAt: Date;
  }): Promise<any> {
    try {
      // Get all existing designs from file
      let allDesigns = await this.getAllStoredDesigns();

      // Enhanced design object with proper URL extraction for Ideogram V3
      const extractImageUrl = (result: any) => {
        if (!result) return null;
        
        // Direct URL
        if (typeof result === 'string' && result.startsWith('http')) {
          return result;
        }
        
        // Check url property
        if (result.url) return result.url;
        
        // Ideogram V3 response format: data array
        if (result.data && Array.isArray(result.data) && result.data[0]?.url) {
          return result.data[0].url;
        }
        
        // Ideogram V3 numbered format (0, 1, 2...)
        if (result['0'] && result['0'].url) {
          return result['0'].url;
        }
        
        // Legacy format support
        if (Array.isArray(result) && result[0]?.url) {
          return result[0].url;
        }
        
        return null;
      };

      const imageUrl = extractImageUrl(data.result);
      
      const newDesign = {
        id: (await import('crypto')).randomUUID(),
        userId: data.userId,
        prompt: data.prompt,
        options: data.options,
        result: data.result,
        url: imageUrl, // Store extracted URL for easy access
        status: 'completed',
        downloadCount: 0,
        isBookmarked: false,
        createdAt: data.createdAt.toISOString()
      };

      console.log('💾 Saving new design:', {
        id: newDesign.id,
        userId: data.userId,
        imageUrl: imageUrl,
        resultFormat: typeof data.result
      });

      // Add to beginning of array (newest first)
      allDesigns.unshift(newDesign);

      // Keep only last 1000 designs per user to prevent unlimited growth
      const userDesigns = allDesigns.filter(d => d.userId === data.userId);
      if (userDesigns.length > 1000) {
        const otherDesigns = allDesigns.filter(d => d.userId !== data.userId);
        const limitedUserDesigns = userDesigns.slice(0, 1000);
        allDesigns = [...limitedUserDesigns, ...otherDesigns];
      }

      // Store all designs back to file
      await this.storeDesigns(allDesigns);

      console.log('✅ Design saved successfully. Total designs:', allDesigns.length);
      return newDesign;
    } catch (error) {
      console.error('❌ Error saving design generation:', error);
      throw error;
    }
  }

  async getDesignHistory(userId: string, options: { page: number; limit: number }): Promise<{
    designs: any[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const userDesigns = await this.getStoredDesigns(userId);
      const sortedDesigns = userDesigns.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ); // Newest first

      const start = (options.page - 1) * options.limit;
      const end = start + options.limit;

      return {
        designs: sortedDesigns.slice(start, end),
        total: sortedDesigns.length,
        page: options.page,
        totalPages: Math.ceil(sortedDesigns.length / options.limit)
      };
    } catch (error) {
      console.error('Error fetching design history:', error);
      return {
        designs: [],
        total: 0,
        page: options.page,
        totalPages: 0
      };
    }
  }

  private async getAllStoredDesigns(): Promise<any[]> {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const designsPath = path.join(process.cwd(), 'design-history.json');

      if (fs.existsSync(designsPath)) {
        const data = fs.readFileSync(designsPath, 'utf8');
        let allDesigns = JSON.parse(data);

        // Ensure allDesigns is an array
        if (!Array.isArray(allDesigns)) {
          console.warn('Design history file corrupted, resetting to empty array');
          allDesigns = [];
        }

        return allDesigns;
      }
      return [];
    } catch (error) {
      console.error('Error reading all designs:', error);
      return [];
    }
  }

  async getDesignById(designId: string, userId: string): Promise<any | null> {
    const designHistory = this.getStoredDesigns();
    return designHistory.find(design => design.id === designId && design.userId === userId) || null;
  }

  async deleteDesign(designId: string, userId: string): Promise<boolean> {
    try {
      const allDesigns = await this.getAllStoredDesigns();
      const designIndex = allDesigns.findIndex(design => design.id === designId && design.userId === userId);

      if (designIndex !== -1) {
        allDesigns.splice(designIndex, 1);
        await this.storeDesigns(allDesigns);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting design:', error);
      return false;
    }
  }

  async bookmarkDesign(designId: string, userId: string): Promise<boolean> {
    const designHistory = this.getStoredDesigns();
    const design = designHistory.find(d => d.id === designId && d.userId === userId);

    if (design) {
      design.isBookmarked = !design.isBookmarked;
      this.storeDesigns(designHistory);
      return true;
    }
    return false;
  }


}

export const storage = new DatabaseStorage();
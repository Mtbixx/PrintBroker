import { prisma } from '../lib/prisma.js';
import { AppError } from '../errors/AppError.js';
import { AuthenticationError, AuthorizationError, NotFoundError } from '../errors/index.js';

export interface MessageCreateInput {
  userId: string;
  quoteId: string;
  content: string;
  attachments?: string[];
}

export interface MessageQueryOptions {
  page?: number;
  limit?: number;
}

export class ChatService {
  async sendMessage(input: MessageCreateInput) {
    try {
      const message = await prisma.message.create({
        data: {
          userId: input.userId,
          quoteId: input.quoteId,
          content: input.content,
          attachments: input.attachments || [],
        },
      });
      return message;
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      throw new AppError('Mesaj gönderilemedi', 500);
    }
  }

  async getMessages(quoteId: string, options: MessageQueryOptions) {
    try {
      const { page = 1, limit = 50 } = options;
      const skip = (page - 1) * limit;

      const messages = await prisma.message.findMany({
        where: { quoteId },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      });
      return messages;
    } catch (error) {
      console.error('Mesajları alma hatası:', error);
      throw new AppError('Mesajlar alınamadı', 500);
    }
  }

  async getMessageById(messageId: string) {
    try {
      const message = await prisma.message.findUnique({
        where: { id: messageId },
      });
      return message;
    } catch (error) {
      console.error('Mesajı ID ile alma hatası:', error);
      throw new AppError('Mesaj bulunamadı', 404);
    }
  }

  async deleteMessage(messageId: string) {
    try {
      await prisma.message.delete({
        where: { id: messageId },
      });
      return true;
    } catch (error) {
      console.error('Mesaj silme hatası:', error);
      throw new AppError('Mesaj silinemedi', 500);
    }
  }

  async getUnreadMessageCount(userId: string, quoteId: string) {
    try {
      const count = await prisma.message.count({
        where: {
          quoteId,
          userId: {
            not: userId, // Current user'ın göndermediği mesajlar
          },
          read: false,
        },
      });
      return count;
    } catch (error) {
      console.error('Okunmamış mesaj sayısı alma hatası:', error);
      throw new AppError('Okunmamış mesaj sayısı alınamadı', 500);
    }
  }

  async markMessagesAsRead(userId: string, quoteId: string) {
    try {
      await prisma.message.updateMany({
        where: {
          quoteId,
          userId: {
            not: userId, // Current user'ın göndermediği mesajlar
          },
          read: false,
        },
        data: {
          read: true,
        },
      });
      return true;
    } catch (error) {
      console.error('Mesajları okundu olarak işaretleme hatası:', error);
      throw new AppError('Mesajlar okundu olarak işaretlenemedi', 500);
    }
  }
}

export const chatService = new ChatService(); 
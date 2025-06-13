import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import userRoutes from './routes/userRoutes.js';
import quoteRoutes from './routes/quoteRoutes.js';
import fileRoutes from './routes/fileRoutes.js';

export async function registerRoutes(app: Express): Promise<Server> {
  // Route modüllerini kullan
  app.use('/api', userRoutes);
  app.use('/api', quoteRoutes);
  app.use('/api', fileRoutes);

  // WebSocket sunucusu
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        // WebSocket mesaj işleme mantığı
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  return server;
}
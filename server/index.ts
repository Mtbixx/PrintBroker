import dotenv from 'dotenv'; dotenv.config();
import express, { type Request, Response, NextFunction } from "express";
import cors from 'cors';
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import { execSync } from 'child_process';
import { corsOptions, securityHeaders } from "./corsConfig.js";
import { generalLimiter } from "./rateLimiter.js";
import { handleSEORoute } from "./seoRenderer.js";
import { errorHandler } from "./errors.js";

const app = express();

// Security ve CORS middleware'leri ilk sırada
app.use(cors(corsOptions));
app.use(securityHeaders);

// Trust proxy for rate limiting (Replit için gerekli)
app.set('trust proxy', 1);

// Global rate limiting
app.use('/api/', generalLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson: any, ...args: any[]) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api") && res.statusCode !== 304) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;

      // Only log response for errors or slow requests
      if (res.statusCode >= 400 || duration > 1000) {
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse).slice(0, 100)}`;
        }
      }

      if (logLine.length > 120) {
        logLine = logLine.slice(0, 119) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Versiyonlu API örneği
const v1Router = express.Router();

v1Router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', version: 'v1' });
});

app.use('/api/v1', v1Router);

(async () => {
  const server = await registerRoutes(app);

  // Global unhandled promise rejection handler
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
    // Log stack trace if available
    if (reason instanceof Error) {
      console.error('Stack:', reason.stack);
    }
  });

  // Global uncaught exception handler
  process.on('uncaughtException', (error: Error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });

  app.use(errorHandler);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // SEO middleware for bots
  app.use(handleSEORoute);

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
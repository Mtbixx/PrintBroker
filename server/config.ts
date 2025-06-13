import { z } from "zod";
import { config as dotenvConfig } from "dotenv";

// Load environment variables
dotenvConfig();

// Define the configuration schema
const configSchema = z.object({
  env: z.enum(["development", "test", "production"]),
  port: z.number().default(3000),
  baseUrl: z.string().url(),
  session: z.object({
    secret: z.string().min(32),
    cookie: z.object({
      secure: z.boolean(),
      maxAge: z.number(),
    }),
  }),
  jwt: z.object({
    secret: z.string().min(32),
    expiresIn: z.string().default("1d"),
  }),
  database: z.object({
    url: z.string().url(),
  }),
  redis: z.object({
    url: z.string().url(),
  }),
  cors: z.object({
    origin: z.string().url(),
    credentials: z.boolean(),
  }),
  paytr: z.object({
    merchantId: z.string(),
    merchantKey: z.string(),
    merchantSalt: z.string(),
  }),
  ideogram: z.object({
    apiKey: z.string(),
  }),
  openai: z.object({
    apiKey: z.string(),
  }),
});

// Create the configuration object
export const config = {
  env: (process.env.NODE_ENV || "development") as "development" | "test" | "production",
  port: parseInt(process.env.PORT || "3000", 10),
  baseUrl: process.env.BASE_URL || "http://localhost:3000",
  session: {
    secret: process.env.SESSION_SECRET || "your-session-secret-key-min-32-chars-long",
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your-jwt-secret-key-min-32-chars-long",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  },
  database: {
    url: process.env.DATABASE_URL || "postgres://localhost:5432/printbroker",
  },
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  },
  paytr: {
    merchantId: process.env.PAYTR_MERCHANT_ID || "",
    merchantKey: process.env.PAYTR_MERCHANT_KEY || "",
    merchantSalt: process.env.PAYTR_MERCHANT_SALT || "",
  },
  ideogram: {
    apiKey: process.env.IDEOGRAM_API_KEY || "",
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
  },
};

// Validate the configuration
export const validatedConfig = configSchema.parse(config); 
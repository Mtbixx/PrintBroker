CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS "users" (
  "id" text PRIMARY KEY DEFAULT uuid_generate_v4(),
  "email" text NOT NULL UNIQUE,
  "password" text NOT NULL,
  "name" text NOT NULL,
  "company" text NOT NULL,
  "role" text NOT NULL CHECK ("role" IN ('admin', 'printer', 'customer')),
  "phone" text,
  "address" text,
  "city" text,
  "postal_code" text,
  "tax_number" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "quotes" (
  "id" text PRIMARY KEY DEFAULT uuid_generate_v4(),
  "customer_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "printer_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "status" text NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending', 'accepted', 'rejected', 'completed')),
  "description" text NOT NULL,
  "price" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
); 
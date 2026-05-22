import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  buyerName: text("buyer_name").notNull(),
  buyerEmail: text("buyer_email").notNull(),
  buyerMobile: text("buyer_mobile").notNull().default(""),
  buyerAddress: text("buyer_address").notNull().default(""),
  status: text("status").notNull().default("completed"),
  stickers: text("stickers").notNull(), // Stores JSON stringified array of selected sticker IDs
  photos: text("photos").notNull(),     // Stores JSON stringified array of uploaded base64 photos
  amount: integer("amount").notNull(),  // Total amount in cents/currency unit
  receiptPhoto: text("receipt_photo"),  // Stores payment receipt base64 image
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOrderSchema = z.object({
  buyerName: z.string(),
  buyerEmail: z.string(),
  buyerMobile: z.string(),
  buyerAddress: z.string(),
  status: z.string().optional(),
  stickers: z.string(),
  photos: z.string(),
  amount: z.number(),
  receiptPhoto: z.string().optional().nullable(),
});
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;

export const reviewsTable = pgTable("reviews", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  handle: text("handle").notNull(),
  text: text("text").notNull(),
  rating: integer("rating").notNull(),
  emoji: text("emoji").notNull().default("✨"),
  photos: text("photos"),               // Stores JSON stringified array of uploaded review photos (base64)
  enabled: boolean("enabled").notNull().default(false),
  rank: integer("rank").notNull().default(0),
  glowColor: text("glow_color").notNull().default("rgba(232,87,58,0.25)"),
  borderColor: text("border_color").notNull().default("rgba(232,87,58,0.2)"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReviewSchema = z.object({
  name: z.string(),
  handle: z.string(),
  text: z.string(),
  rating: z.number(),
  emoji: z.string().optional(),
  photos: z.string().optional().nullable(),
  enabled: z.boolean().optional(),
  rank: z.number().optional(),
  glowColor: z.string().optional(),
  borderColor: z.string().optional(),
});
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviewsTable.$inferSelect;

export const contactSubmissionsTable = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  subject: text("subject"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertContactSubmissionSchema = z.object({
  name: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string(),
});
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissionsTable.$inferSelect;

export const callbackRequestsTable = pgTable("callback_requests", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCallbackRequestSchema = z.object({
  phone: z.string(),
  status: z.string().optional(),
});
export type InsertCallbackRequest = z.infer<typeof insertCallbackRequestSchema>;
export type CallbackRequest = typeof callbackRequestsTable.$inferSelect;
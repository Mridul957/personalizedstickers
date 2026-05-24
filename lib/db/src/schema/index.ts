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
  appliedCoupon: text("applied_coupon"), // Coupon code applied (optional)
  discountAmount: integer("discount_amount").notNull().default(0), // Amount discounted (optional)
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
  appliedCoupon: z.string().optional().nullable(),
  discountAmount: z.number().optional(),
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

// New Stickers Table for remote & local storage database
export const stickersTable = pgTable("stickers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  tag: text("tag").notNull().default("Romance"),
  emoji: text("emoji").notNull().default("✨"),
  image: text("image"), // Base64 representation or URL
  enabled: boolean("enabled").notNull().default(true),
  trending: boolean("trending").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStickerSchema = z.object({
  name: z.string(),
  tag: z.string().optional(),
  emoji: z.string().optional(),
  image: z.string().optional().nullable(),
  enabled: z.boolean().optional(),
  trending: z.boolean().optional(),
});
export type InsertSticker = z.infer<typeof insertStickerSchema>;
export type StickerDb = typeof stickersTable.$inferSelect;

// New Coupons Table
export const couponsTable = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // e.g. "LOVE20"
  discountPct: integer("discount_pct").notNull(), // percentage discount e.g. 20 for 20%
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCouponSchema = z.object({
  code: z.string().min(1),
  discountPct: z.number().min(1).max(100),
  active: z.boolean().optional(),
});
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type Coupon = typeof couponsTable.$inferSelect;
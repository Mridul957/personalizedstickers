import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq, asc, desc } from "drizzle-orm";
import * as schema from "./schema";
import { ordersTable, reviewsTable, contactSubmissionsTable, callbackRequestsTable, stickersTable, couponsTable, type Order, type Review, type ContactSubmission, type CallbackRequest, type Coupon } from "./schema";
import fs from "fs";
import path from "path";

export * from "./schema";

const LOCAL_DB_PATH = path.resolve(import.meta.dirname, "../db.json");

let dbInstance: any = null;
let poolInstance: any = null;

const usePostgres = !!process.env.DATABASE_URL;

if (usePostgres) {
  const { Pool } = pg;
  poolInstance = new Pool({ connectionString: process.env.DATABASE_URL });
  dbInstance = drizzle(poolInstance, { schema });
}

interface LocalDbSchema {
  reviews: Review[];
  orders: Order[];
  contactSubmissions: ContactSubmission[];
  callbackRequests: CallbackRequest[];
  stickers?: any[];
  coupons?: Coupon[];
}

const DEFAULT_REVIEWS: Review[] = [
  {
    id: 1,
    name: "Sarah & Mark",
    handle: "@sarahandmark",
    text: "I got these for our anniversary and cried when I saw them. They look exactly like us, down to my favorite jacket.",
    rating: 5,
    emoji: "🥺",
    photos: "[]",
    enabled: true,
    rank: 1,
    glowColor: "rgba(43,170,143,0.25)",
    borderColor: "rgba(43,170,143,0.2)",
    createdAt: new Date(),
  },
  {
    id: 2,
    name: "Jessica P.",
    handle: "@jessicap",
    text: "Put one on my laptop and my boyfriend put one on his water bottle. The quality is incredible.",
    rating: 5,
    emoji: "💛",
    photos: "[]",
    enabled: true,
    rank: 2,
    glowColor: "rgba(232,196,90,0.22)",
    borderColor: "rgba(232,196,90,0.18)",
    createdAt: new Date(),
  },
  {
    id: 3,
    name: "David T.",
    handle: "@davidt",
    text: "Such a unique gift. The packaging felt super premium, like something you'd get from a luxury brand.",
    rating: 5,
    emoji: "🔥",
    photos: "[]",
    enabled: true,
    rank: 3,
    glowColor: "rgba(240,147,106,0.22)",
    borderColor: "rgba(240,147,106,0.18)",
    createdAt: new Date(),
  },
  {
    id: 4,
    name: "Liam & Sophia",
    handle: "@liamandsophia",
    text: "Absolutely adorable! We put them on our phone cases. Everyone asks where we got them!",
    rating: 5,
    emoji: "🥰",
    photos: "[]",
    enabled: true,
    rank: 4,
    glowColor: "rgba(232,87,58,0.25)",
    borderColor: "rgba(232,87,58,0.2)",
    createdAt: new Date(),
  },
  {
    id: 5,
    name: "Emma & Noah",
    handle: "@emmanoah",
    text: "The custom details are perfect. She even got my messy hair exactly right! Best anniversary gift ever.",
    rating: 5,
    emoji: "🎨",
    photos: "[]",
    enabled: true,
    rank: 5,
    glowColor: "rgba(43,170,143,0.25)",
    borderColor: "rgba(43,170,143,0.2)",
    createdAt: new Date(),
  },
  {
    id: 6,
    name: "Olivia & James",
    handle: "@olivia_james",
    text: "Super high quality vinyl! Waterproof and scratch-resistant. Ours have been on our travel mugs for months and still look brand new.",
    rating: 5,
    emoji: "✨",
    photos: "[]",
    enabled: true,
    rank: 6,
    glowColor: "rgba(232,196,90,0.22)",
    borderColor: "rgba(232,196,90,0.18)",
    createdAt: new Date(),
  },
  {
    id: 7,
    name: "Isabella & Lucas",
    handle: "@isa_lucas",
    text: "Customer service was incredibly sweet and helpful. The packaging was beautiful too. 10/10 experience!",
    rating: 5,
    emoji: "🎁",
    photos: "[]",
    enabled: true,
    rank: 7,
    glowColor: "rgba(240,147,106,0.22)",
    borderColor: "rgba(240,147,106,0.18)",
    createdAt: new Date(),
  },
  {
    id: 8,
    name: "Mia & Ethan",
    handle: "@mia_ethan",
    text: "I surprised him with these for Valentine's Day. He's not usually a softie, but he absolutely loved it!",
    rating: 5,
    emoji: "💖",
    photos: "[]",
    enabled: true,
    rank: 8,
    glowColor: "rgba(232,87,58,0.25)",
    borderColor: "rgba(232,87,58,0.2)",
    createdAt: new Date(),
  },
  {
    id: 9,
    name: "Charlotte & Alex",
    handle: "@char_alex",
    text: "Stickers are thick and the print resolution is superb. Definitely ordering another batch for our friends.",
    rating: 5,
    emoji: "🌟",
    photos: "[]",
    enabled: true,
    rank: 9,
    glowColor: "rgba(43,170,143,0.25)",
    borderColor: "rgba(43,170,143,0.2)",
    createdAt: new Date(),
  },
  {
    id: 10,
    name: "Amelia & Leo",
    handle: "@amelia_leo",
    text: "Stuck one on my Kindle and another on my laptop. It makes me smile every time I look at it. Highly recommend!",
    rating: 5,
    emoji: "📖",
    photos: "[]",
    enabled: true,
    rank: 10,
    glowColor: "rgba(232,196,90,0.22)",
    borderColor: "rgba(232,196,90,0.18)",
    createdAt: new Date(),
  },
  {
    id: 11,
    name: "Harper & Benjamin",
    handle: "@harper_ben",
    text: "The design phase was so fast, and they got the adjustments I asked for perfectly. Wonderful artist!",
    rating: 5,
    emoji: "⚡",
    photos: "[]",
    enabled: true,
    rank: 11,
    glowColor: "rgba(240,147,106,0.22)",
    borderColor: "rgba(240,147,106,0.18)",
    createdAt: new Date(),
  },
  {
    id: 12,
    name: "Evelyn & Mason",
    handle: "@evelyn_mason",
    text: "Such a sweet, simple way to carry a piece of us wherever we go. The sticky backing is solid.",
    rating: 5,
    emoji: "🚲",
    photos: "[]",
    enabled: true,
    rank: 12,
    glowColor: "rgba(232,87,58,0.25)",
    borderColor: "rgba(232,87,58,0.2)",
    createdAt: new Date(),
  },
  {
    id: 13,
    name: "Abigail & Daniel",
    handle: "@abigail_dan",
    text: "These stickers brought so much joy. The caricature is incredibly cute and captures our vibe perfectly.",
    rating: 5,
    emoji: "🥳",
    photos: "[]",
    enabled: true,
    rank: 13,
    glowColor: "rgba(43,170,143,0.25)",
    borderColor: "rgba(43,170,143,0.2)",
    createdAt: new Date(),
  }
];

const DEFAULT_STICKERS_DATA: any[] = [
  { id: 1,  name: "The First Kiss",     tag: "Romance",    emoji: "💋", enabled: true,  trending: true  },
  { id: 2,  name: "Forever Hug",        tag: "Cozy",       emoji: "🤗", enabled: true,  trending: false },
  { id: 3,  name: "Sleepy Together",    tag: "Soft Love",  emoji: "😴", enabled: true,  trending: false },
  { id: 4,  name: "Late Night Calls",   tag: "Emotional",  emoji: "🌙", enabled: true,  trending: true  },
  { id: 5,  name: "Matching Hoodies",   tag: "Cute",       emoji: "👫", enabled: true,  trending: false },
  { id: 6,  name: "Coffee Date",        tag: "Classic",    emoji: "☕", enabled: true,  trending: false },
  { id: 7,  name: "Holding Hands",      tag: "Classic",    emoji: "🤝", enabled: true,  trending: false },
  { id: 8,  name: "Movie Night",        tag: "Cozy",       emoji: "🎬", enabled: true,  trending: false },
  { id: 9,  name: "Forever Yours",      tag: "Romance",    emoji: "💍", enabled: true,  trending: true  },
  { id: 10, name: "Cute Fight",         tag: "Playful",    emoji: "🥊", enabled: true,  trending: false },
  { id: 11, name: "Rainy Walk",         tag: "Emotional",  emoji: "☂️", enabled: true,  trending: false },
  { id: 12, name: "Long Distance Love", tag: "Emotional",  emoji: "✈️", enabled: true,  trending: false },
  { id: 13, name: "Soft Smile",         tag: "Soft Love",  emoji: "🥰", enabled: true,  trending: false },
  { id: 14, name: "Together Always",    tag: "Classic",    emoji: "♾️", enabled: true,  trending: false },
  { id: 15, name: "Dance Together",     tag: "Playful",    emoji: "💃", enabled: true,  trending: false },
  { id: 16, name: "Blushing Love",      tag: "Romance",    emoji: "😊", enabled: true,  trending: false },
  { id: 17, name: "Lazy Sunday",        tag: "Cozy",       emoji: "🛋️", enabled: true,  trending: false },
  { id: 18, name: "Heart Hands",        tag: "Cute",       emoji: "🫶", enabled: true,  trending: true  },
  { id: 19, name: "Ice Cream Date",     tag: "Cute",       emoji: "🍦", enabled: true,  trending: false },
  { id: 20, name: "Cozy Moments",       tag: "Cozy",       emoji: "🧣", enabled: true,  trending: false },
  { id: 21, name: "Stolen Glances",     tag: "Romance",    emoji: "👀", enabled: true,  trending: false },
  { id: 22, name: "Good Morning Kiss",  tag: "Soft Love",  emoji: "🌅", enabled: true,  trending: false },
  { id: 23, name: "Stargazing Night",   tag: "Emotional",  emoji: "🌟", enabled: true,  trending: false },
  { id: 24, name: "Pinky Promise",      tag: "Cute",       emoji: "🤙", enabled: true,  trending: false },
  { id: 25, name: "Reading Together",   tag: "Cozy",       emoji: "📖", enabled: true,  trending: false },
  { id: 26, name: "Beach Walk",         tag: "Classic",    emoji: "🌊", enabled: true,  trending: false },
  { id: 27, name: "Surprise Hug",       tag: "Playful",    emoji: "🎁", enabled: true,  trending: false },
  { id: 28, name: "Matching Outfits",   tag: "Trending",   emoji: "👗", enabled: true,  trending: true  },
  { id: 29, name: "Selfie Time",        tag: "Trending",   emoji: "🤳", enabled: true,  trending: false },
  { id: 30, name: "Forever & Always",   tag: "Emotional",  emoji: "💞", enabled: true,  trending: false }
];

function readLocalDb(): LocalDbSchema {
  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const content = fs.readFileSync(LOCAL_DB_PATH, "utf-8");
      const parsed = JSON.parse(content) as LocalDbSchema;
      if (!parsed.reviews) parsed.reviews = DEFAULT_REVIEWS;
      if (!parsed.orders) parsed.orders = [];
      if (!parsed.contactSubmissions) parsed.contactSubmissions = [];
      if (!parsed.callbackRequests) parsed.callbackRequests = [];
      if (!parsed.stickers) parsed.stickers = DEFAULT_STICKERS_DATA;
      if (!parsed.coupons) parsed.coupons = [];
      return parsed;
    }
  } catch (error) {
    console.error("Failed to read local JSON database, resetting...", error);
  }
  
  const initialDb: LocalDbSchema = {
    reviews: DEFAULT_REVIEWS,
    orders: [],
    contactSubmissions: [],
    callbackRequests: [],
    stickers: DEFAULT_STICKERS_DATA,
    coupons: [],
  };
  writeLocalDb(initialDb);
  return initialDb;
}

function writeLocalDb(data: LocalDbSchema) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write to local JSON database", error);
  }
}

// --- CRUD Database Adapter Functions ---

async function seedReviewsIfEmpty() {
  if (!usePostgres || !dbInstance) return;
  try {
    const countRes = await dbInstance.select().from(reviewsTable).limit(1);
    if (countRes.length === 0) {
      console.log("Supabase reviews table is empty. Seeding default reviews...");
      for (const r of DEFAULT_REVIEWS) {
        await dbInstance.insert(reviewsTable).values({
          name: r.name,
          handle: r.handle,
          text: r.text,
          rating: r.rating,
          emoji: r.emoji,
          photos: JSON.stringify(r.photos || []),
          enabled: r.enabled,
          rank: r.rank,
          glowColor: r.glowColor,
          borderColor: r.borderColor,
          createdAt: new Date(),
        });
      }
      console.log("Successfully seeded default reviews to Supabase!");
    }
  } catch (error) {
    console.error("Failed to seed default reviews to Supabase:", error);
  }
}

export async function getReviews(): Promise<Review[]> {
  if (usePostgres) {
    await seedReviewsIfEmpty();
    return await dbInstance
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.enabled, true))
      .orderBy(asc(reviewsTable.rank), desc(reviewsTable.createdAt));
  } else {
    const data = readLocalDb();
    return data.reviews
      .filter((r) => r.enabled)
      .sort((a, b) => {
        if (a.rank !== b.rank) return a.rank - b.rank;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }
}

export async function getAllReviewsAdmin(): Promise<Review[]> {
  if (usePostgres) {
    await seedReviewsIfEmpty();
    return await dbInstance
      .select()
      .from(reviewsTable)
      .orderBy(asc(reviewsTable.rank), desc(reviewsTable.createdAt));
  } else {
    const data = readLocalDb();
    return data.reviews.sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
}

export async function createReview(review: Omit<Review, "id" | "createdAt">): Promise<Review> {
  if (usePostgres) {
    const [inserted] = await dbInstance
      .insert(reviewsTable)
      .values(review)
      .returning();
    return inserted;
  } else {
    const data = readLocalDb();
    const id = data.reviews.length > 0 ? Math.max(...data.reviews.map((r) => r.id)) + 1 : 1;
    const newReview: Review = {
      id,
      ...review,
      createdAt: new Date(),
    };
    data.reviews.push(newReview);
    writeLocalDb(data);
    return newReview;
  }
}

export async function updateReview(id: number, updates: Partial<Omit<Review, "id" | "createdAt">>): Promise<Review> {
  if (usePostgres) {
    const [updated] = await dbInstance
      .update(reviewsTable)
      .set(updates)
      .where(eq(reviewsTable.id, id))
      .returning();
    if (!updated) throw new Error(`Review with id ${id} not found`);
    return updated;
  } else {
    const data = readLocalDb();
    const index = data.reviews.findIndex((r) => r.id === id);
    if (index === -1) throw new Error(`Review with id ${id} not found`);
    const updatedReview: Review = {
      ...data.reviews[index],
      ...updates,
    };
    data.reviews[index] = updatedReview;
    writeLocalDb(data);
    return updatedReview;
  }
}

export async function getOrders(): Promise<Order[]> {
  if (usePostgres) {
    return await dbInstance
      .select()
      .from(ordersTable)
      .orderBy(desc(ordersTable.createdAt));
  } else {
    const data = readLocalDb();
    return data.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export async function createOrder(order: Omit<Order, "id" | "createdAt">): Promise<Order> {
  if (usePostgres) {
    const [inserted] = await dbInstance
      .insert(ordersTable)
      .values(order)
      .returning();
    return inserted;
  } else {
    const data = readLocalDb();
    const id = data.orders.length > 0 ? Math.max(...data.orders.map((o) => o.id)) + 1 : 1;
    const newOrder: Order = {
      id,
      ...order,
      discountAmount: order.discountAmount ?? 0,
      appliedCoupon: order.appliedCoupon ?? null,
      createdAt: new Date(),
    };
    data.orders.push(newOrder);
    writeLocalDb(data);
    return newOrder;
  }
}

export async function updateOrderStatus(id: number, status: string): Promise<Order> {
  if (usePostgres) {
    const [updated] = await dbInstance
      .update(ordersTable)
      .set({ status })
      .where(eq(ordersTable.id, id))
      .returning();
    if (!updated) throw new Error(`Order with id ${id} not found`);
    return updated;
  } else {
    const data = readLocalDb();
    const index = data.orders.findIndex((o) => o.id === id);
    if (index === -1) throw new Error(`Order with id ${id} not found`);
    const updatedOrder: Order = {
      ...data.orders[index],
      status,
    };
    data.orders[index] = updatedOrder;
    writeLocalDb(data);
    return updatedOrder;
  }
}

export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  if (usePostgres) {
    return await dbInstance
      .select()
      .from(contactSubmissionsTable)
      .orderBy(desc(contactSubmissionsTable.createdAt));
  } else {
    const data = readLocalDb();
    return (data.contactSubmissions || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export async function createContactSubmission(submission: Omit<ContactSubmission, "id" | "createdAt">): Promise<ContactSubmission> {
  if (usePostgres) {
    const [inserted] = await dbInstance
      .insert(contactSubmissionsTable)
      .values(submission)
      .returning();
    return inserted;
  } else {
    const data = readLocalDb();
    if (!data.contactSubmissions) data.contactSubmissions = [];
    const id = data.contactSubmissions.length > 0 ? Math.max(...data.contactSubmissions.map((s) => s.id)) + 1 : 1;
    const newSubmission: ContactSubmission = {
      id,
      ...submission,
      createdAt: new Date(),
    };
    data.contactSubmissions.push(newSubmission);
    writeLocalDb(data);
    return newSubmission;
  }
}

export async function getCallbackRequests(): Promise<CallbackRequest[]> {
  if (usePostgres) {
    return await dbInstance
      .select()
      .from(callbackRequestsTable)
      .orderBy(desc(callbackRequestsTable.createdAt));
  } else {
    const data = readLocalDb();
    return (data.callbackRequests || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export async function createCallbackRequest(request: Omit<CallbackRequest, "id" | "createdAt" | "status">): Promise<CallbackRequest> {
  if (usePostgres) {
    const [inserted] = await dbInstance
      .insert(callbackRequestsTable)
      .values({ ...request, status: "pending" })
      .returning();
    return inserted;
  } else {
    const data = readLocalDb();
    if (!data.callbackRequests) data.callbackRequests = [];
    const id = data.callbackRequests.length > 0 ? Math.max(...data.callbackRequests.map((c) => c.id)) + 1 : 1;
    const newRequest: CallbackRequest = {
      id,
      phone: request.phone,
      status: "pending",
      createdAt: new Date(),
    };
    data.callbackRequests.push(newRequest);
    writeLocalDb(data);
    return newRequest;
  }
}

export async function updateCallbackRequestStatus(id: number, status: string): Promise<CallbackRequest> {
  if (usePostgres) {
    const [updated] = await dbInstance
      .update(callbackRequestsTable)
      .set({ status })
      .where(eq(callbackRequestsTable.id, id))
      .returning();
    if (!updated) throw new Error(`Callback request with id ${id} not found`);
    return updated;
  } else {
    const data = readLocalDb();
    if (!data.callbackRequests) data.callbackRequests = [];
    const index = data.callbackRequests.findIndex((c) => c.id === id);
    if (index === -1) throw new Error(`Callback request with id ${id} not found`);
    const updatedRequest: CallbackRequest = {
      ...data.callbackRequests[index],
      status,
    };
    data.callbackRequests[index] = updatedRequest;
    writeLocalDb(data);
    return updatedRequest;
  }
}

const SETTINGS_FILE_PATH = path.resolve(import.meta.dirname, "../settings.json");

export interface SettingsData {
  stickerPrice: number;
  billDiscount: number;
  announcementEnabled?: boolean;
  announcementText?: string;
}

export function getSettings(): SettingsData {
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const content = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
      const parsed = JSON.parse(content) as SettingsData;
      return {
        stickerPrice: parsed.stickerPrice || 40,
        billDiscount: parsed.billDiscount || 0,
        announcementEnabled: parsed.announcementEnabled !== undefined ? parsed.announcementEnabled : false,
        announcementText: parsed.announcementText || "",
      };
    }
  } catch (e) {
    console.error("Failed to read settings, using default:", e);
  }
  return { stickerPrice: 40, billDiscount: 0, announcementEnabled: false, announcementText: "" };
}

export function updateSettings(data: SettingsData): SettingsData {
  try {
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write settings:", e);
  }
  return data;
}

// --- Stickers Table DB Adapter & Seeder Functions ---

async function seedStickersIfEmpty() {
  // Seeder disabled to prevent default/old stickers from ever repopulating.
  return;
}

export async function getStickers(): Promise<any[]> {
  if (usePostgres) {
    await seedStickersIfEmpty();
    return await dbInstance
      .select()
      .from(stickersTable)
      .orderBy(asc(stickersTable.id));
  } else {
    const data = readLocalDb();
    if (!data.stickers) data.stickers = DEFAULT_STICKERS_DATA;
    return data.stickers;
  }
}

export async function createSticker(sticker: any): Promise<any> {
  if (usePostgres) {
    const [inserted] = await dbInstance
      .insert(stickersTable)
      .values(sticker)
      .returning();
    return inserted;
  } else {
    const data = readLocalDb();
    if (!data.stickers) data.stickers = DEFAULT_STICKERS_DATA;
    const id = data.stickers.length > 0 ? Math.max(...data.stickers.map((s) => s.id)) + 1 : 1;
    const newSticker = { id, ...sticker };
    data.stickers.push(newSticker);
    writeLocalDb(data);
    return newSticker;
  }
}

export async function updateSticker(id: number, updates: any): Promise<any> {
  if (usePostgres) {
    const [updated] = await dbInstance
      .update(stickersTable)
      .set(updates)
      .where(eq(stickersTable.id, id))
      .returning();
    if (!updated) throw new Error(`Sticker with id ${id} not found`);
    return updated;
  } else {
    const data = readLocalDb();
    if (!data.stickers) data.stickers = DEFAULT_STICKERS_DATA;
    const index = data.stickers.findIndex((s) => s.id === id);
    if (index === -1) throw new Error(`Sticker with id ${id} not found`);
    const updatedSticker = {
      ...data.stickers[index],
      ...updates,
    };
    data.stickers[index] = updatedSticker;
    writeLocalDb(data);
    return updatedSticker;
  }
}

export async function deleteSticker(id: number): Promise<void> {
  if (usePostgres) {
    await dbInstance
      .delete(stickersTable)
      .where(eq(stickersTable.id, id));
  } else {
    const data = readLocalDb();
    if (!data.stickers) data.stickers = DEFAULT_STICKERS_DATA;
    data.stickers = data.stickers.filter((s) => s.id !== id);
    writeLocalDb(data);
  }
}

// --- Coupons Table DB Adapter & Seeder Functions ---

export async function getCoupons(): Promise<Coupon[]> {
  if (usePostgres) {
    return await dbInstance
      .select()
      .from(couponsTable)
      .orderBy(desc(couponsTable.createdAt));
  } else {
    const data = readLocalDb();
    if (!data.coupons) data.coupons = [];
    return data.coupons.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  if (usePostgres) {
    const [coupon] = await dbInstance
      .select()
      .from(couponsTable)
      .where(eq(couponsTable.code, code.toUpperCase().trim()))
      .limit(1);
    return coupon || null;
  } else {
    const data = readLocalDb();
    if (!data.coupons) data.coupons = [];
    const coupon = data.coupons.find((c) => c.code.toUpperCase().trim() === code.toUpperCase().trim());
    return coupon || null;
  }
}

export async function createCoupon(coupon: Omit<Coupon, "id" | "createdAt">): Promise<Coupon> {
  const formatted = {
    ...coupon,
    code: coupon.code.toUpperCase().trim(),
  };
  if (usePostgres) {
    const [inserted] = await dbInstance
      .insert(couponsTable)
      .values(formatted)
      .returning();
    return inserted;
  } else {
    const data = readLocalDb();
    if (!data.coupons) data.coupons = [];
    const id = data.coupons.length > 0 ? Math.max(...data.coupons.map((c) => c.id)) + 1 : 1;
    const newCoupon: Coupon = {
      id,
      ...formatted,
      createdAt: new Date(),
    };
    data.coupons.push(newCoupon);
    writeLocalDb(data);
    return newCoupon;
  }
}

export async function updateCoupon(id: number, updates: Partial<Omit<Coupon, "id" | "createdAt">>): Promise<Coupon> {
  const formatted = { ...updates };
  if (formatted.code) {
    formatted.code = formatted.code.toUpperCase().trim();
  }
  if (usePostgres) {
    const [updated] = await dbInstance
      .update(couponsTable)
      .set(formatted)
      .where(eq(couponsTable.id, id))
      .returning();
    if (!updated) throw new Error(`Coupon with id ${id} not found`);
    return updated;
  } else {
    const data = readLocalDb();
    if (!data.coupons) data.coupons = [];
    const index = data.coupons.findIndex((c) => c.id === id);
    if (index === -1) throw new Error(`Coupon with id ${id} not found`);
    const updatedCoupon: Coupon = {
      ...data.coupons[index],
      ...formatted,
    };
    data.coupons[index] = updatedCoupon;
    writeLocalDb(data);
    return updatedCoupon;
  }
}

export async function deleteCoupon(id: number): Promise<void> {
  if (usePostgres) {
    await dbInstance
      .delete(couponsTable)
      .where(eq(couponsTable.id, id));
  } else {
    const data = readLocalDb();
    if (!data.coupons) data.coupons = [];
    data.coupons = data.coupons.filter((c) => c.id !== id);
    writeLocalDb(data);
  }
}



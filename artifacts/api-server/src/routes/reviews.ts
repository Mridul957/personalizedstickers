import { Router } from "express";
import { getReviews, getAllReviewsAdmin, createReview, updateReview } from "@workspace/db";

const router = Router();

const EMOJIS = ["💋", "🤗", "😴", "🌙", "👫", "☕", "🤝", "🎬", "💍", "🥊", "🥰", "✨", "💞", "💖", "🌸", "🌻", "🫂", "💌"];

const COLOR_PAIRS = [
  { glow: "rgba(43,170,143,0.25)", border: "rgba(43,170,143,0.2)" }, // Teal
  { glow: "rgba(232,87,58,0.25)", border: "rgba(232,87,58,0.2)" },  // Coral
  { glow: "rgba(232,196,90,0.22)", border: "rgba(232,196,90,0.18)" }, // Amber
  { glow: "rgba(240,147,106,0.22)", border: "rgba(240,147,106,0.18)" }, // Peach
  { glow: "rgba(167,139,250,0.25)", border: "rgba(167,139,250,0.2)" }, // Lavender
];

// Admin password authorization middleware helper
export function requireAdminPassword(req: any, res: any, next: any) {
  const password = req.headers["x-admin-password"];
  const passcode = process.env.ADMIN_PASSCODE || "8523";
  if (password === passcode) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized. Invalid admin password." });
  }
}

// Public: Get all enabled/approved reviews
router.get("/", async (req, res) => {
  try {
    const reviews = await getReviews();
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch reviews" });
  }
});

// Public: Submit a review
router.post("/", async (req, res) => {
  try {
    const { name, rating, text, photos } = req.body;
    
    if (!name || !text || !rating) {
      res.status(400).json({ error: "Name, rating, and text are required fields." });
      return;
    }

    const randomEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const randomColor = COLOR_PAIRS[Math.floor(Math.random() * COLOR_PAIRS.length)];
    const cleanHandle = "@" + name.toLowerCase().replace(/[^a-z0-9]/g, "");

    const newReview = await createReview({
      name,
      handle: cleanHandle,
      text,
      rating: Number(rating),
      emoji: randomEmoji,
      photos: photos ? JSON.stringify(photos) : "[]",
      enabled: false, // Must be enabled/approved by admin
      rank: 0,
      glowColor: randomColor.glow,
      borderColor: randomColor.border,
    });

    res.status(201).json(newReview);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to submit review" });
  }
});

// Admin: Get all reviews (approved and pending)
router.get("/admin", requireAdminPassword, async (req, res) => {
  try {
    const reviews = await getAllReviewsAdmin();
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch admin reviews" });
  }
});

// Admin: Toggle review approval / change rank
router.patch("/admin/:id", requireAdminPassword, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { enabled, rank } = req.body;

    const updates: any = {};
    if (enabled !== undefined) updates.enabled = Boolean(enabled);
    if (rank !== undefined) updates.rank = Number(rank);

    const updated = await updateReview(id, updates);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update review" });
  }
});

export default router;

import { Router } from "express";
import { getStickers, createSticker, updateSticker, deleteSticker } from "@workspace/db";
import { requireAdminPassword } from "./reviews";

const router = Router();

// GET /api/stickers -> get all stickers in database
router.get("/", async (req, res) => {
  try {
    const stickers = await getStickers();
    res.json(stickers);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch stickers" });
  }
});

// POST /api/stickers -> create a new sticker (admin-only)
router.post("/", requireAdminPassword, async (req, res) => {
  try {
    const { name, tag, emoji, image, enabled, trending } = req.body;
    if (!name) {
      res.status(400).json({ error: "Name is a required field." });
      return;
    }

    const newSticker = await createSticker({
      name,
      tag: tag || "Romance",
      emoji: emoji || "✨",
      image: image || null,
      enabled: enabled !== undefined ? Boolean(enabled) : true,
      trending: trending !== undefined ? Boolean(trending) : false,
    });

    res.status(201).json(newSticker);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create sticker" });
  }
});

// PATCH /api/stickers/:id -> update a sticker (admin-only)
router.patch("/:id", requireAdminPassword, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, tag, emoji, image, enabled, trending } = req.body;

    const updates: any = {};
    if (name !== undefined) updates.name = String(name);
    if (tag !== undefined) updates.tag = String(tag);
    if (emoji !== undefined) updates.emoji = String(emoji);
    if (image !== undefined) updates.image = image; // Can be base64 or null
    if (enabled !== undefined) updates.enabled = Boolean(enabled);
    if (trending !== undefined) updates.trending = Boolean(trending);

    const updated = await updateSticker(id, updates);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update sticker" });
  }
});

// DELETE /api/stickers/:id -> delete a sticker (admin-only)
router.delete("/:id", requireAdminPassword, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await deleteSticker(id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete sticker" });
  }
});

export default router;

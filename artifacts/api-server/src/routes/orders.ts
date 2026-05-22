import { Router } from "express";
import { getOrders, createOrder, updateOrderStatus, getSettings, updateSettings } from "@workspace/db";
import { requireAdminPassword } from "./reviews";

const router = Router();

// Public: Submit a completed order / payment
router.post("/", async (req, res) => {
  try {
    const { buyerName, buyerEmail, buyerMobile, buyerAddress, stickers, photos, amount, receiptPhoto } = req.body;

    if (!buyerName || !buyerEmail || !buyerMobile || !buyerAddress || !stickers || !photos || amount === undefined) {
      res.status(400).json({ error: "Buyer details (name, email, mobile, address), stickers, photos, and amount are required." });
      return;
    }

    const newOrder = await createOrder({
      buyerName,
      buyerEmail,
      buyerMobile,
      buyerAddress,
      status: "completed",
      stickers: JSON.stringify(stickers),
      photos: JSON.stringify(photos),
      amount: Number(amount),
      receiptPhoto: receiptPhoto || null,
    });

    res.status(201).json(newOrder);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to save order" });
  }
});

// Admin: Get all orders
router.get("/admin", requireAdminPassword, async (req, res) => {
  try {
    const orders = await getOrders();
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch orders" });
  }
});

// Admin: Update order status
router.patch("/admin/:id/status", requireAdminPassword, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ error: "Status is required." });
      return;
    }

    const updated = await updateOrderStatus(id, status);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update order status" });
  }
});

// Public: Get global settings
router.get("/settings", async (req, res) => {
  try {
    const settings = getSettings();
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch settings" });
  }
});

// Admin: Update global settings
router.post("/settings", requireAdminPassword, async (req, res) => {
  try {
    const { stickerPrice, billDiscount } = req.body;

    if (stickerPrice === undefined || billDiscount === undefined) {
      res.status(400).json({ error: "stickerPrice and billDiscount are required." });
      return;
    }

    const updated = updateSettings({
      stickerPrice: Number(stickerPrice),
      billDiscount: Number(billDiscount),
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update settings" });
  }
});

export default router;


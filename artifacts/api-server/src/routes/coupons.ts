import { Router } from "express";
import { getCoupons, getCouponByCode, createCoupon, updateCoupon, deleteCoupon } from "@workspace/db";
import { requireAdminPassword } from "./reviews";

const router = Router();

// Public: Validate a coupon code
router.get("/validate/:code", async (req, res) => {
  try {
    const code = req.params.code.trim();
    if (!code) {
      res.status(400).json({ valid: false, error: "Coupon code is required." });
      return;
    }

    const coupon = await getCouponByCode(code);
    if (!coupon) {
      res.status(404).json({ valid: false, error: "Invalid coupon code." });
      return;
    }

    if (!coupon.active) {
      res.status(400).json({ valid: false, error: "This coupon is no longer active." });
      return;
    }

    res.json({
      valid: true,
      code: coupon.code,
      discountPct: coupon.discountPct,
    });
  } catch (error: any) {
    res.status(500).json({ valid: false, error: error.message || "Failed to validate coupon" });
  }
});

// Admin: Get all coupons
router.get("/admin", requireAdminPassword, async (req, res) => {
  try {
    const coupons = await getCoupons();
    res.json(coupons);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch coupons" });
  }
});

// Admin: Create a new coupon
router.post("/admin", requireAdminPassword, async (req, res) => {
  try {
    const { code, discountPct, active } = req.body;

    if (!code || discountPct === undefined) {
      res.status(400).json({ error: "Code and discountPct are required." });
      return;
    }

    const formattedCode = code.toUpperCase().trim();
    
    // Check if code already exists
    const existing = await getCouponByCode(formattedCode);
    if (existing) {
      res.status(400).json({ error: `Coupon code '${formattedCode}' already exists.` });
      return;
    }

    const pct = Number(discountPct);
    if (isNaN(pct) || pct < 1 || pct > 100) {
      res.status(400).json({ error: "Discount percentage must be a number between 1 and 100." });
      return;
    }

    const newCoupon = await createCoupon({
      code: formattedCode,
      discountPct: pct,
      active: active !== undefined ? Boolean(active) : true,
    });

    res.status(201).json(newCoupon);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create coupon" });
  }
});

// Admin: Update a coupon (active status / discount percentage)
router.patch("/admin/:id", requireAdminPassword, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { code, discountPct, active } = req.body;

    const updates: any = {};
    if (code !== undefined) updates.code = code.toUpperCase().trim();
    if (active !== undefined) updates.active = Boolean(active);
    
    if (discountPct !== undefined) {
      const pct = Number(discountPct);
      if (isNaN(pct) || pct < 1 || pct > 100) {
        res.status(400).json({ error: "Discount percentage must be a number between 1 and 100." });
        return;
      }
      updates.discountPct = pct;
    }

    const updated = await updateCoupon(id, updates);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update coupon" });
  }
});

// Admin: Delete a coupon
router.delete("/admin/:id", requireAdminPassword, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await deleteCoupon(id);
    res.json({ success: true, message: "Coupon deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete coupon" });
  }
});

export default router;

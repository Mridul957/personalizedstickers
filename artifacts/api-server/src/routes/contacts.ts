import { Router } from "express";
import { 
  getContactSubmissions, 
  createContactSubmission, 
  getCallbackRequests, 
  createCallbackRequest, 
  updateCallbackRequestStatus 
} from "@workspace/db";
import { requireAdminPassword } from "./reviews";

const router = Router();

// Public: Submit a contact message
router.post("/submit", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !message) {
      res.status(400).json({ error: "Name and message are required fields." });
      return;
    }

    const newSubmission = await createContactSubmission({
      name,
      email: email || null,
      phone: phone || null,
      subject: subject || null,
      message,
    });

    res.status(201).json(newSubmission);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to submit contact message" });
  }
});

// Public: Submit a callback request
router.post("/callback", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      res.status(400).json({ error: "Phone number is required." });
      return;
    }

    const newCallback = await createCallbackRequest({
      phone,
    });

    res.status(201).json(newCallback);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to submit callback request" });
  }
});

// Admin: Get all contact submissions
router.get("/admin/submissions", requireAdminPassword, async (req, res) => {
  try {
    const submissions = await getContactSubmissions();
    res.json(submissions);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch submissions" });
  }
});

// Admin: Get all callback requests
router.get("/admin/callbacks", requireAdminPassword, async (req, res) => {
  try {
    const callbacks = await getCallbackRequests();
    res.json(callbacks);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch callbacks" });
  }
});

// Admin: Update callback status
router.patch("/admin/callbacks/:id/status", requireAdminPassword, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ error: "Status is required." });
      return;
    }

    const updated = await updateCallbackRequestStatus(id, status);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update callback status" });
  }
});

export default router;

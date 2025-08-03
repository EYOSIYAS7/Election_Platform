import express from "express";
import Association from "../models/Association.js";

const router = express.Router();

// POST /api/association - Create a new association
router.post("/", async (req, res) => {
  const { sub, walletAddress } = req.body;
  try {
    const existing = await Association.findOne({ sub });
    if (existing) {
      return res.status(400).json({ error: "Association already exists" });
    }
    const association = new Association({ sub, walletAddress });
    await association.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/association/:sub - Get association by sub
router.get("/:sub", async (req, res) => {
  const { sub } = req.params;
  try {
    const association = await Association.findOne({ sub });
    if (!association) {
      return res.status(404).json({ error: "No association found" });
    }
    res.json({ walletAddress: association.walletAddress });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;

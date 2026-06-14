import express from "express";
import { authenticate } from "../middleware/auth.js";
import { Memory } from "../models/Memory.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const memoryRouter = express.Router();

memoryRouter.use(authenticate);

memoryRouter.get(
  "/search",
  asyncHandler(async (req, res) => {
    const q = String(req.query.q ?? "");
    const query = q
      ? {
          $or: [
            { key: { $regex: q, $options: "i" } },
            { value: { $regex: q, $options: "i" } },
            { source: { $regex: q, $options: "i" } },
            { tags: { $regex: q, $options: "i" } }
          ]
        }
      : {};
    const memories = await Memory.find(query).sort({ updatedAt: -1 }).limit(50);
    res.json({ memories });
  })
);

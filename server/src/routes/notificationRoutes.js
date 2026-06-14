import express from "express";
import { authenticate } from "../middleware/auth.js";
import { Notification } from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";

export const notificationRouter = express.Router();

notificationRouter.use(authenticate);

notificationRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const notifications = await Notification.find({
      $or: [{ userId: req.user.id }, { userId: null }]
    }).sort({ createdAt: -1 });
    res.json({ notifications });
  })
);

notificationRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { $set: { read: req.body.read ?? true } },
      { new: true }
    );
    if (!notification) throw new HttpError(404, "Notification not found");
    res.json({ notification });
  })
);

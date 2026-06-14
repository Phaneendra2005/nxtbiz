import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { Meeting } from "../models/Meeting.js";
import { Notification } from "../models/Notification.js";
import { emitSocketEvent } from "../realtime/socket.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";

export const meetingRouter = express.Router();

meetingRouter.use(authenticate);

meetingRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const meetings = await Meeting.find().sort({ startTime: 1 });
    res.json({ meetings });
  })
);

meetingRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const meeting = await Meeting.create(req.body);
    await Notification.create({
      userId: req.user.id,
      type: "meeting_created",
      title: "Meeting created",
      message: meeting.title,
      metadata: { meetingId: meeting.id }
    });
    emitSocketEvent("meeting_created", { meetingId: meeting.id });
    res.status(201).json({ meeting });
  })
);

meetingRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const meeting = await Meeting.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!meeting) throw new HttpError(404, "Meeting not found");
    res.json({ meeting });
  })
);

meetingRouter.delete(
  "/:id",
  authorize("Admin"),
  asyncHandler(async (req, res) => {
    const meeting = await Meeting.findByIdAndDelete(req.params.id);
    if (!meeting) throw new HttpError(404, "Meeting not found");
    res.json({ message: "Meeting deleted" });
  })
);

import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { Ticket } from "../models/Ticket.js";
import { Notification } from "../models/Notification.js";
import { emitSocketEvent } from "../realtime/socket.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";

export const ticketRouter = express.Router();

ticketRouter.use(authenticate);

ticketRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const tickets = await Ticket.find().populate("customerId assignedTo").sort({ updatedAt: -1 });
    res.json({ tickets });
  })
);

ticketRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const ticket = await Ticket.create(req.body);
    await Notification.create({
      userId: req.user.id,
      type: "new_ticket",
      title: "Ticket created",
      message: ticket.issue,
      metadata: { ticketId: ticket.id }
    });
    emitSocketEvent("new_ticket", { ticketId: ticket.id, priority: ticket.priority });
    res.status(201).json({ ticket });
  })
);

ticketRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ticket) throw new HttpError(404, "Ticket not found");
    res.json({ ticket });
  })
);

ticketRouter.delete(
  "/:id",
  authorize("Admin", "Manager"),
  asyncHandler(async (req, res) => {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) throw new HttpError(404, "Ticket not found");
    res.json({ message: "Ticket deleted" });
  })
);

import express from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { Email } from "../models/Email.js";
import { Notification } from "../models/Notification.js";
import { analyzeEmail } from "../services/emailIntelligence.js";
import { enqueueOrRunAgentOrchestration } from "../services/agentQueue.js";
import { emitSocketEvent } from "../realtime/socket.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";

export const emailRouter = express.Router();

const processEmailSchema = z.object({
  body: z.object({
    subject: z.string().min(1),
    body: z.string().min(1),
    sender: z.string().email(),
    customerId: z.string().optional()
  })
});

emailRouter.use(authenticate);

emailRouter.post(
  "/process",
  validate(processEmailSchema),
  asyncHandler(async (req, res) => {
    const intelligence = analyzeEmail(req.validated.body);
    const email = await Email.create({
      ...req.validated.body,
      ...intelligence
    });

    await Notification.create({
      userId: req.user.id,
      type: "new_email",
      title: "Email processed",
      message: `${email.sender} was classified as ${email.intent}.`,
      metadata: {
        emailId: email.id,
        urgency: email.urgency
      }
    });

    emitSocketEvent("new_email", {
      emailId: email.id,
      urgency: email.urgency,
      intent: email.intent
    });

    const orchestration = await enqueueOrRunAgentOrchestration({
      emailId: email.id,
      userId: req.user.id
    });

    res.status(201).json({ email, orchestration });
  })
);

emailRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const emails = await Email.find().sort({ createdAt: -1 });
    res.json({ emails });
  })
);

emailRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const email = await Email.findById(req.params.id);

    if (!email) {
      throw new HttpError(404, "Email not found");
    }

    res.json({ email });
  })
);

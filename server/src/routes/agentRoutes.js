import express from "express";
import { z } from "zod";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { Agent } from "../models/Agent.js";
import { AgentExecution } from "../models/AgentExecution.js";
import { enqueueOrRunAgentOrchestration } from "../services/agentQueue.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const agentRouter = express.Router();

const runAgentSchema = z.object({
  body: z.object({
    emailId: z.string().optional(),
    payload: z.record(z.unknown()).optional()
  })
});

agentRouter.use(authenticate);

agentRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const agents = await Agent.find().sort({ agentId: 1 });
    res.json({ agents });
  })
);

agentRouter.get(
  "/executions",
  asyncHandler(async (req, res) => {
    const executions = await AgentExecution.find().sort({ createdAt: -1 }).limit(100);
    res.json({ executions });
  })
);

agentRouter.post(
  "/run",
  authorize("Admin", "Manager"),
  validate(runAgentSchema),
  asyncHandler(async (req, res) => {
    const result = await enqueueOrRunAgentOrchestration({
      emailId: req.validated.body.emailId,
      payload: req.validated.body.payload ?? {},
      userId: req.user.id
    });

    res.status(202).json(result);
  })
);

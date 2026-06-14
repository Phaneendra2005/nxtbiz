import express from "express";
import { authenticate } from "../middleware/auth.js";
import { Notification } from "../models/Notification.js";
import { Ticket } from "../models/Ticket.js";
import { Workflow } from "../models/Workflow.js";
import { emitSocketEvent } from "../realtime/socket.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";

export const workflowRouter = express.Router();

workflowRouter.use(authenticate);

workflowRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const workflows = await Workflow.find().sort({ updatedAt: -1 });
    res.json({ workflows });
  })
);

workflowRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const workflow = await Workflow.create(req.body);
    res.status(201).json({ workflow });
  })
);

workflowRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) throw new HttpError(404, "Workflow not found");
    res.json({ workflow });
  })
);

workflowRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const workflow = await Workflow.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!workflow) throw new HttpError(404, "Workflow not found");
    res.json({ workflow });
  })
);

workflowRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const workflow = await Workflow.findByIdAndDelete(req.params.id);
    if (!workflow) throw new HttpError(404, "Workflow not found");
    res.json({ message: "Workflow deleted" });
  })
);

workflowRouter.post(
  "/:id/execute",
  asyncHandler(async (req, res) => {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) throw new HttpError(404, "Workflow not found");

    const serializedPayload = JSON.stringify(req.body ?? {});
    const conditionMatches = !workflow.condition || serializedPayload.toLowerCase().includes(workflow.condition.toLowerCase());

    if (!conditionMatches) {
      workflow.logs.push({
        status: "skipped",
        message: "Workflow condition did not match payload.",
        payload: req.body
      });
      await workflow.save();
      return res.json({ workflow, executed: false });
    }

    if (workflow.action.toLowerCase().includes("ticket") && req.body.customerId) {
      await Ticket.create({
        customerId: req.body.customerId,
        issue: `Workflow ticket: ${workflow.name}`,
        priority: req.body.urgency === "critical" ? "critical" : "medium"
      });
    }

    if (workflow.action.toLowerCase().includes("notify")) {
      await Notification.create({
        userId: req.user.id,
        type: "workflow_executed",
        title: "Workflow executed",
        message: workflow.name,
        metadata: { workflowId: workflow.id }
      });
    }

    workflow.logs.push({
      status: "completed",
      message: "Workflow executed successfully.",
      payload: req.body
    });
    await workflow.save();
    emitSocketEvent("workflow_executed", { workflowId: workflow.id });
    res.json({ workflow, executed: true });
  })
);

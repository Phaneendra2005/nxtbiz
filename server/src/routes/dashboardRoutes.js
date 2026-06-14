import express from "express";
import { authenticate } from "../middleware/auth.js";
import { AgentExecution } from "../models/AgentExecution.js";
import { Customer } from "../models/Customer.js";
import { Invoice } from "../models/Invoice.js";
import { Ticket } from "../models/Ticket.js";
import { Email } from "../models/Email.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { calculateBusinessHealthScore } from "../services/businessHealth.js";

export const dashboardRouter = express.Router();

dashboardRouter.get(
  "/",
  authenticate,
  asyncHandler(async (req, res) => {
    const [customers, openTickets, invoices, emails, executions] = await Promise.all([
      Customer.countDocuments(),
      Ticket.countDocuments({ status: { $in: ["open", "in_progress"] } }),
      Invoice.find(),
      Email.countDocuments(),
      AgentExecution.find().sort({ createdAt: -1 }).limit(8)
    ]);

    const paidRevenue = invoices
      .filter((invoice) => invoice.status === "paid")
      .reduce((sum, invoice) => sum + invoice.amount, 0);
    const outstandingRevenue = invoices
      .filter((invoice) => invoice.status !== "paid")
      .reduce((sum, invoice) => sum + invoice.amount, 0);

    res.json({
      metrics: {
        customers,
        openTickets,
        emails,
        paidRevenue,
        outstandingRevenue,
        health: calculateBusinessHealthScore()
      },
      executionHistory: executions
    });
  })
);

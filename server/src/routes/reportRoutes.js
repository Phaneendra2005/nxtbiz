import express from "express";
import { authenticate } from "../middleware/auth.js";
import { Report } from "../models/Report.js";
import { generateReportPdf } from "../services/pdfService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";

export const reportRouter = express.Router();

reportRouter.use(authenticate);

reportRouter.post(
  "/generate",
  asyncHandler(async (req, res) => {
    const report = await Report.create({
      type: req.body.type ?? "executive",
      title: req.body.title ?? "NxtBiz Executive Report",
      metrics: req.body.metrics ?? {},
      recommendations: req.body.recommendations ?? ["Review operational exceptions and follow up on urgent accounts."],
      summary: req.body.summary ?? "Generated NxtBiz operations report.",
      generatedBy: req.user.id
    });
    report.pdfUrl = await generateReportPdf({ report });
    await report.save();
    res.status(201).json({ report });
  })
);

reportRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json({ reports });
  })
);

reportRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id);
    if (!report) throw new HttpError(404, "Report not found");
    res.json({ report });
  })
);

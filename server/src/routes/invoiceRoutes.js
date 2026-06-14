import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { Customer } from "../models/Customer.js";
import { Invoice } from "../models/Invoice.js";
import { Notification } from "../models/Notification.js";
import { emitSocketEvent } from "../realtime/socket.js";
import { generateInvoicePdf } from "../services/pdfService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";

export const invoiceRouter = express.Router();

invoiceRouter.use(authenticate);

invoiceRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const invoices = await Invoice.find().populate("customerId").sort({ createdAt: -1 });
    res.json({ invoices });
  })
);

invoiceRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const invoice = await Invoice.create(req.body);
    const customer = await Customer.findById(invoice.customerId);
    invoice.pdfUrl = await generateInvoicePdf({ invoice, customer });
    await invoice.save();
    await Notification.create({
      userId: req.user.id,
      type: "invoice_created",
      title: "Invoice created",
      message: `Invoice ${invoice.id} generated.`,
      metadata: { invoiceId: invoice.id }
    });
    emitSocketEvent("invoice_created", { invoiceId: invoice.id, pdfUrl: invoice.pdfUrl });
    res.status(201).json({ invoice });
  })
);

invoiceRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id).populate("customerId");
    if (!invoice) throw new HttpError(404, "Invoice not found");
    res.json({ invoice });
  })
);

invoiceRouter.get(
  "/:id/download",
  asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice?.pdfUrl) throw new HttpError(404, "Invoice PDF not found");
    res.redirect(invoice.pdfUrl);
  })
);

invoiceRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!invoice) throw new HttpError(404, "Invoice not found");
    res.json({ invoice });
  })
);

invoiceRouter.delete(
  "/:id",
  authorize("Admin"),
  asyncHandler(async (req, res) => {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) throw new HttpError(404, "Invoice not found");
    res.json({ message: "Invoice deleted" });
  })
);

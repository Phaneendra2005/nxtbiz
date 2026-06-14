import express from "express";
import { z } from "zod";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { Customer } from "../models/Customer.js";
import { CRMActivity } from "../models/CRMActivity.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";

export const customerRouter = express.Router();

const customerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    company: z.string().optional(),
    tags: z.array(z.string()).optional(),
    notes: z.string().optional(),
    preferences: z.record(z.unknown()).optional(),
    healthScore: z.number().min(0).max(100).optional()
  })
});

const updateCustomerSchema = z.object({
  body: customerSchema.shape.body.partial()
});

customerRouter.use(authenticate);

customerRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const customers = await Customer.find().sort({ updatedAt: -1 });
    res.json({ customers });
  })
);

customerRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const [customer, timeline] = await Promise.all([
      Customer.findById(req.params.id),
      CRMActivity.find({ customerId: req.params.id }).sort({ createdAt: -1 })
    ]);

    if (!customer) {
      throw new HttpError(404, "Customer not found");
    }

    res.json({ customer, timeline });
  })
);

customerRouter.post(
  "/",
  validate(customerSchema),
  asyncHandler(async (req, res) => {
    const customer = await Customer.create(req.validated.body);
    res.status(201).json({ customer });
  })
);

customerRouter.put(
  "/:id",
  validate(updateCustomerSchema),
  asyncHandler(async (req, res) => {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.validated.body, {
      new: true,
      runValidators: true
    });

    if (!customer) {
      throw new HttpError(404, "Customer not found");
    }

    res.json({ customer });
  })
);

customerRouter.delete(
  "/:id",
  authorize("Admin"),
  asyncHandler(async (req, res) => {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      throw new HttpError(404, "Customer not found");
    }

    res.json({ message: "Customer deleted" });
  })
);

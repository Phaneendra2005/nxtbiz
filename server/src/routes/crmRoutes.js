import express from "express";
import { authenticate } from "../middleware/auth.js";
import { CRMActivity } from "../models/CRMActivity.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const crmRouter = express.Router();

crmRouter.use(authenticate);

crmRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const activities = await CRMActivity.find().populate("customerId createdBy").sort({ createdAt: -1 }).limit(100);
    res.json({ activities });
  })
);

const createActivity = (type) =>
  asyncHandler(async (req, res) => {
    const activity = await CRMActivity.create({
      ...req.body,
      type,
      createdBy: req.user.id
    });
    res.status(201).json({ activity });
  });

crmRouter.post("/note", createActivity("note"));
crmRouter.post("/activity", createActivity("activity"));

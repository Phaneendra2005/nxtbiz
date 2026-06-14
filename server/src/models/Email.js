import mongoose from "mongoose";

export const sentimentValues = ["positive", "neutral", "negative"];
export const urgencyValues = ["low", "medium", "high", "critical"];
export const intentValues = [
  "general_inquiry",
  "schedule_meeting",
  "invoice_request",
  "support_request",
  "sales_opportunity"
];

const emailSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    sender: { type: String, required: true, trim: true, lowercase: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
    sentiment: { type: String, enum: sentimentValues, default: "neutral" },
    intent: { type: String, enum: intentValues, default: "general_inquiry" },
    urgency: { type: String, enum: urgencyValues, default: "low" },
    confidence: { type: Number, min: 0, max: 1, default: 0.5 },
    autoResponse: { type: String, default: "" },
    recommendations: [{ type: String }],
    processed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Email = mongoose.model("Email", emailSchema);

import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    metrics: { type: mongoose.Schema.Types.Mixed, default: {} },
    recommendations: [{ type: String }],
    summary: { type: String, default: "" },
    pdfUrl: { type: String, default: "" },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
  },
  { timestamps: true }
);

export const Report = mongoose.model("Report", reportSchema);

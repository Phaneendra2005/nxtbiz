import mongoose from "mongoose";

const memorySchema = new mongoose.Schema(
  {
    scope: { type: String, required: true, trim: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
    agentId: { type: String, default: "" },
    key: { type: String, required: true, trim: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    tags: [{ type: String, trim: true }],
    source: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

memorySchema.index({ key: "text", value: "text" });

export const Memory = mongoose.model("Memory", memorySchema);

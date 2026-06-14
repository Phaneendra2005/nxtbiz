import mongoose from "mongoose";

const workflowStepSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["trigger", "condition", "action"],
      required: true
    },
    label: { type: String, required: true },
    config: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { _id: false }
);

const workflowSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    trigger: { type: String, required: true, trim: true },
    condition: { type: String, default: "" },
    action: { type: String, required: true, trim: true },
    steps: [workflowStepSchema],
    enabled: { type: Boolean, default: true },
    logs: [
      {
        status: { type: String, enum: ["completed", "skipped", "failed"], required: true },
        message: { type: String, required: true },
        payload: { type: mongoose.Schema.Types.Mixed, default: {} },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export const Workflow = mongoose.model("Workflow", workflowSchema);

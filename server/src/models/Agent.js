import mongoose from "mongoose";

export const agentIds = [
  "intent-agent",
  "task-planner-agent",
  "email-agent",
  "crm-agent",
  "meeting-agent",
  "invoice-agent",
  "customer-support-agent",
  "chief-of-staff-agent"
];

const agentSchema = new mongoose.Schema(
  {
    agentId: { type: String, required: true, unique: true, enum: agentIds },
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ["idle", "running", "failed"],
      default: "idle"
    },
    lastExecution: { type: Date, default: null },
    logs: [{ type: String }],
    capabilities: [{ type: String }]
  },
  { timestamps: true }
);

export const Agent = mongoose.model("Agent", agentSchema);

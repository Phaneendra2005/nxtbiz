import mongoose from "mongoose";

const agentExecutionSchema = new mongoose.Schema(
  {
    agentId: { type: String, required: true },
    eventId: { type: String, required: true },
    status: {
      type: String,
      enum: ["queued", "running", "completed", "failed"],
      default: "queued"
    },
    input: { type: mongoose.Schema.Types.Mixed, default: {} },
    output: { type: mongoose.Schema.Types.Mixed, default: {} },
    logs: [{ type: String }],
    startedAt: { type: Date, default: null },
    finishedAt: { type: Date, default: null },
    error: { type: String, default: "" }
  },
  { timestamps: true }
);

export const AgentExecution = mongoose.model("AgentExecution", agentExecutionSchema);

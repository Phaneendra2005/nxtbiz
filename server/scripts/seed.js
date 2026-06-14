import bcrypt from "bcryptjs";
import { connectDb } from "../src/config/db.js";
import { Agent, agentIds } from "../src/models/Agent.js";
import { Customer } from "../src/models/Customer.js";
import { User } from "../src/models/User.js";
import { Workflow } from "../src/models/Workflow.js";

await connectDb();

const adminEmail = "admin@nxtbiz.local";
const adminPassword = "Admin12345";

const passwordHash = await bcrypt.hash(adminPassword, 12);

await User.updateOne(
  { email: adminEmail },
  {
    $set: {
      name: "NxtBiz Admin",
      email: adminEmail,
      passwordHash,
      role: "Admin",
      active: true
    }
  },
  { upsert: true }
);

const customer = await Customer.findOneAndUpdate(
  { email: "operations@example.com" },
  {
    $set: {
      name: "Example Operations",
      email: "operations@example.com",
      phone: "+1 555 0100",
      company: "Example Co",
      tags: ["demo", "priority"],
      notes: "Sample customer for NxtBiz local development.",
      healthScore: 82
    }
  },
  { upsert: true, new: true }
);

await Workflow.updateOne(
  { name: "Negative Email Escalation" },
  {
    $set: {
      name: "Negative Email Escalation",
      trigger: "email.processed",
      condition: "negative",
      action: "create ticket and notify manager",
      enabled: true,
      steps: [
        { type: "trigger", label: "Email processed", config: { event: "new_email" } },
        { type: "condition", label: "Negative sentiment", config: { sentiment: "negative" } },
        { type: "action", label: "Create ticket and notify", config: { ticket: true, notify: true } }
      ]
    },
    $setOnInsert: {
      logs: []
    }
  },
  { upsert: true }
);

await Promise.all(
  agentIds.map((agentId) =>
    Agent.updateOne(
      { agentId },
      {
        $set: {
          agentId,
          name: agentId
            .split("-")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" "),
          capabilities: ["spec-driven routing", "operation logging"],
          status: "idle"
        }
      },
      { upsert: true }
    )
  )
);

console.log("NxtBiz seed complete.");
console.log(`Admin login: ${adminEmail}`);
console.log(`Admin password: ${adminPassword}`);
console.log(`Sample customer: ${customer.name}`);

process.exit(0);

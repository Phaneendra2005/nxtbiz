import crypto from "crypto";
import { Agent, agentIds } from "../models/Agent.js";
import { AgentExecution } from "../models/AgentExecution.js";
import { CRMActivity } from "../models/CRMActivity.js";
import { Customer } from "../models/Customer.js";
import { Email } from "../models/Email.js";
import { Invoice } from "../models/Invoice.js";
import { Meeting } from "../models/Meeting.js";
import { Memory } from "../models/Memory.js";
import { Notification } from "../models/Notification.js";
import { generateInvoicePdf } from "./pdfService.js";
import { emitSocketEvent } from "../realtime/socket.js";

const taskPlannerRules = {
  schedule_meeting: ["meeting-agent"],
  invoice_request: ["invoice-agent"],
  support_request: ["customer-support-agent"],
  sales_opportunity: ["email-agent"],
  general_inquiry: ["email-agent"]
};

export const getPlannedAgents = (intent) => [
  ...(taskPlannerRules[intent] ?? taskPlannerRules.general_inquiry),
  "crm-agent"
];

const ensureAgentsExist = async () => {
  await Promise.all(
    agentIds.map((agentId) =>
      Agent.updateOne(
        { agentId },
        {
          $setOnInsert: {
            agentId,
            name: agentId
              .split("-")
              .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
              .join(" "),
            status: "idle",
            capabilities: ["spec-driven execution"]
          }
        },
        { upsert: true }
      )
    )
  );
};

// --- Agent-specific handlers ---

const runMeetingAgent = async ({ email, customer }) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  const startTime = new Date(tomorrow);
  const endTime = new Date(tomorrow);
  endTime.setHours(11, 0, 0, 0);

  const meeting = await Meeting.create({
    title: `Follow-up: ${email.subject}`,
    startTime,
    endTime,
    attendees: customer?.email ? [customer.email] : [],
    notes: `Auto-created from email: ${email.subject}`,
    status: "scheduled",
    customerId: customer?._id ?? null
  });

  console.log(`[meeting-agent] Created meeting ${meeting._id}`);
  return {
    summary: `Meeting scheduled: ${meeting._id}`,
    meetingId: meeting._id.toString(),
    title: meeting.title
  };
};

const runCrmAgent = async ({ email, customer, userId }) => {
  if (!customer) {
    console.log("[crm-agent] No customer matched — CRM activity skipped");
    return { summary: "No customer matched, CRM activity skipped" };
  }

  const activity = await CRMActivity.create({
    customerId: customer._id,
    type: "email",
    title: `Email received: ${email.subject}`,
    body: email.body,
    createdBy: userId ?? null,
    metadata: { sender: email.sender, intent: email.intent }
  });

  console.log(`[crm-agent] Created CRM activity ${activity._id}`);

  const memory = await Memory.create({
    scope: "customer",
    customerId: customer._id,
    key: "email_interaction",
    value: `${email.subject} - ${email.intent}`,
    tags: [email.intent, email.sentiment].filter(Boolean),
    source: "crm-agent"
  });

  console.log(`[crm-agent] Created memory entry ${memory._id}`);
  return {
    summary: `CRM activity logged: ${activity._id}`,
    activityId: activity._id.toString(),
    memoryId: memory._id.toString()
  };
};

const runInvoiceAgent = async ({ email, customer }) => {
  if (!customer) {
    console.log("[invoice-agent] No customer matched — skipping invoice");
    return { summary: "No customer matched, skipping invoice" };
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  const invoice = await Invoice.create({
    customerId: customer._id,
    amount: 0,
    status: "draft",
    dueDate,
    lineItems: [{ description: `From email: ${email?.subject ?? "Manual run"}`, quantity: 1, unitPrice: 0 }]
  });

  const pdfUrl = await generateInvoicePdf({ invoice, customer });
  invoice.pdfUrl = pdfUrl;
  await invoice.save();

  console.log(`[invoice-agent] Created draft invoice ${invoice._id} with PDF ${pdfUrl}`);
  return {
    summary: `Draft invoice created: ${invoice._id}`,
    invoiceId: invoice._id.toString(),
    pdfUrl
  };
};

const runEmailAgent = async ({ email }) => {
  const subject = email?.subject ?? "No subject";
  const autoResponse = email?.autoResponse ?? "";
  console.log(`[email-agent] Draft response logged for: ${subject}`);
  return {
    summary: `Draft response logged for: ${subject}`,
    draftResponse: autoResponse
  };
};

const agentHandlers = {
  "meeting-agent": runMeetingAgent,
  "crm-agent": runCrmAgent,
  "invoice-agent": runInvoiceAgent,
  "email-agent": runEmailAgent
};

// --- Core execution engine ---

const executeAgent = async ({ agentId, eventId, context }) => {
  const startedAt = new Date();

  await Agent.updateOne(
    { agentId },
    {
      $set: { status: "running", lastExecution: startedAt },
      $push: { logs: `${startedAt.toISOString()} started ${eventId}` }
    }
  );

  const execution = await AgentExecution.create({
    agentId,
    eventId,
    status: "running",
    input: {
      intent: context.intent,
      urgency: context.urgency,
      emailId: context.emailId,
      customerId: context.customer?._id ?? null
    },
    logs: [`${agentId} started`],
    startedAt
  });

  let output;
  try {
    const handler = agentHandlers[agentId];
    output = handler
      ? await handler(context)
      : {
          summary: `${agentId} completed for ${context.intent ?? "operational event"}`,
          recommendations: context.recommendations ?? []
        };
  } catch (err) {
    execution.status = "failed";
    execution.output = { error: err.message };
    execution.logs.push(`${agentId} failed: ${err.message}`);
    execution.finishedAt = new Date();
    await execution.save();

    await Agent.updateOne(
      { agentId },
      {
        $set: { status: "failed", lastExecution: execution.finishedAt },
        $push: { logs: `${execution.finishedAt.toISOString()} failed ${eventId}: ${err.message}` }
      }
    );
    throw err;
  }

  execution.status = "completed";
  execution.output = output;
  execution.logs.push(`${agentId} completed`);
  execution.finishedAt = new Date();
  await execution.save();

  await Agent.updateOne(
    { agentId },
    {
      $set: { status: "idle", lastExecution: execution.finishedAt },
      $push: { logs: `${execution.finishedAt.toISOString()} completed ${eventId}` }
    }
  );

  return execution;
};

export const runAgentOrchestration = async ({ emailId = null, payload = {}, userId = null }) => {
  await ensureAgentsExist();

  const eventId = crypto.randomUUID();
  const email = emailId ? await Email.findById(emailId) : null;

  // When no real email is available (e.g. manual run from AI Control),
  // build a synthetic object so all agent handlers always receive valid data.
  const contextEmail = email ?? {
    subject: "Manual agent run",
    body: "Triggered manually from AI Control Center",
    sender: "system@nxtbiz.com",
    intent: payload.intent ?? "general_inquiry",
    sentiment: payload.sentiment ?? "neutral",
    urgency: payload.urgency ?? "low",
    autoResponse: "Thank you for your message.",
    recommendations: payload.recommendations ?? ["Review manually"]
  };

  // Match sender to a known customer record (system sender will return null)
  const customer = contextEmail.sender
    ? await Customer.findOne({ email: contextEmail.sender.toLowerCase() })
    : null;

  const context = {
    eventId,
    emailId,
    email: contextEmail,
    customer,
    userId,
    intent: contextEmail.intent ?? "general_inquiry",
    urgency: contextEmail.urgency ?? "low",
    sentiment: contextEmail.sentiment ?? "neutral",
    recommendations: contextEmail.recommendations ?? []
  };

  const plannedAgents = getPlannedAgents(context.intent);
  const executionPlan = [
    "intent-agent",
    "task-planner-agent",
    ...plannedAgents,
    "chief-of-staff-agent"
  ];

  const executions = [];

  for (const agentId of executionPlan) {
    const execution = await executeAgent({ agentId, eventId, context });
    executions.push(execution);
  }

  if (email) {
    email.processed = true;
    await email.save();
  }

  const notification = await Notification.create({
    userId,
    type: "agent_completed",
    title: "Agent orchestration completed",
    message: `NxtBiz completed ${executions.length} agent steps.`,
    metadata: {
      eventId,
      emailId,
      agents: executionPlan
    }
  });

  emitSocketEvent("agent_completed", {
    eventId,
    emailId,
    agents: executionPlan,
    notificationId: notification.id
  });

  return {
    eventId,
    agents: executionPlan,
    executions
  };
};

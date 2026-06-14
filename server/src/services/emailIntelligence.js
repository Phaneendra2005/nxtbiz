const negativeWords = ["angry", "cancel", "broken", "refund", "late", "complaint", "urgent", "bad", "issue", "failed"];
const positiveWords = ["thanks", "great", "love", "happy", "excellent", "appreciate", "renew"];
const criticalWords = ["urgent", "asap", "immediately"];

const countMatches = (text, words) => words.filter((word) => text.includes(word)).length;

export const analyzeEmail = ({ subject, body }) => {
  const text = `${subject} ${body}`.toLowerCase();
  const negativeScore = countMatches(text, negativeWords);
  const positiveScore = countMatches(text, positiveWords);
  const hasCriticalSignal = criticalWords.some((word) => text.includes(word));

  let sentiment = "neutral";
  if (negativeScore > positiveScore) {
    sentiment = "negative";
  }
  if (positiveScore > negativeScore) {
    sentiment = "positive";
  }

  let intent = "general_inquiry";
  if (text.includes("meeting") || text.includes("schedule") || text.includes("call")) {
    intent = "schedule_meeting";
  } else if (text.includes("invoice") || text.includes("billing") || text.includes("payment")) {
    intent = "invoice_request";
  } else if (text.includes("support") || text.includes("broken") || text.includes("issue") || text.includes("failed")) {
    intent = "support_request";
  } else if (text.includes("demo") || text.includes("pricing") || text.includes("renew") || text.includes("proposal")) {
    intent = "sales_opportunity";
  }

  let urgency = "low";
  if (hasCriticalSignal) {
    urgency = "critical";
  } else if (negativeScore >= 2) {
    urgency = "high";
  } else if (negativeScore === 1 || text.includes("soon")) {
    urgency = "medium";
  }

  const recommendations = [];

  if (urgency === "critical" || sentiment === "negative") {
    recommendations.push("Escalate to a manager and create a follow-up ticket.");
  }

  if (intent === "schedule_meeting") {
    recommendations.push("Offer available meeting slots and capture attendees.");
  }

  if (intent === "invoice_request") {
    recommendations.push("Review account balance and prepare invoice details.");
  }

  if (intent === "sales_opportunity") {
    recommendations.push("Assign an owner and add the opportunity to the CRM timeline.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Acknowledge the request and log the interaction in CRM.");
  }

  return {
    sentiment,
    intent,
    urgency,
    confidence: Math.min(0.95, 0.55 + (positiveScore + negativeScore) * 0.1),
    autoResponse: "Thanks for contacting NxtBiz operations. We have logged your request and will follow up shortly.",
    recommendations
  };
};

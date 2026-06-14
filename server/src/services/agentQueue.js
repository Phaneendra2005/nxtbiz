import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { env } from "../config/env.js";
import { runAgentOrchestration } from "./agentOrchestration.js";

let queue = null;
let worker = null;

export const initializeAgentQueue = () => {
  if (!env.REDIS_URL) {
    console.warn("Redis is unavailable. NxtBiz agent orchestration will run synchronously.");
    return;
  }

  const connection = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null
  });

  queue = new Queue("agent-orchestration", {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000
      },
      removeOnComplete: 100,
      removeOnFail: 100
    }
  });

  worker = new Worker(
    "agent-orchestration",
    async (job) => runAgentOrchestration(job.data),
    {
      connection,
      concurrency: 4
    }
  );

  worker.on("failed", (job, error) => {
    console.error(`NxtBiz agent job ${job?.id} failed: ${error.message}`);
  });

  console.log("NxtBiz BullMQ agent queue initialized.");
};

export const enqueueOrRunAgentOrchestration = async (payload) => {
  if (!queue) {
    return runAgentOrchestration(payload);
  }

  const job = await queue.add("orchestrate", payload);
  return {
    queued: true,
    jobId: job.id
  };
};

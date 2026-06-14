import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { agentRouter } from "./routes/agentRoutes.js";
import { authRouter } from "./routes/authRoutes.js";
import { crmRouter } from "./routes/crmRoutes.js";
import { customerRouter } from "./routes/customerRoutes.js";
import { dashboardRouter } from "./routes/dashboardRoutes.js";
import { emailRouter } from "./routes/emailRoutes.js";
import { invoiceRouter } from "./routes/invoiceRoutes.js";
import { meetingRouter } from "./routes/meetingRoutes.js";
import { memoryRouter } from "./routes/memoryRoutes.js";
import { notificationRouter } from "./routes/notificationRoutes.js";
import { reportRouter } from "./routes/reportRoutes.js";
import { ticketRouter } from "./routes/ticketRoutes.js";
import { userRouter } from "./routes/userRoutes.js";
import { workflowRouter } from "./routes/workflowRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

export const createApp = () => {
  const app = express();
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true
    })
  );
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use("/pdfs", express.static(path.resolve(__dirname, "../storage/pdfs")));

  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      service: "NxtBiz API",
      timestamp: new Date().toISOString()
    });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/users", userRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/customers", customerRouter);
  app.use("/api/emails", emailRouter);
  app.use("/api/crm", crmRouter);
  app.use("/api/meetings", meetingRouter);
  app.use("/api/invoices", invoiceRouter);
  app.use("/api/tickets", ticketRouter);
  app.use("/api/reports", reportRouter);
  app.use("/api/agents", agentRouter);
  app.use("/api/workflows", workflowRouter);
  app.use("/api/memory", memoryRouter);
  app.use("/api/notifications", notificationRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

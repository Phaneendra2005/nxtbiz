import http from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { setSocketServer } from "./realtime/socket.js";
import { initializeAgentQueue } from "./services/agentQueue.js";

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.CLIENT_ORIGIN,
    credentials: true
  }
});

setSocketServer(io);

io.on("connection", (socket) => {
  console.log(`NxtBiz Socket.IO client connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`NxtBiz Socket.IO client disconnected: ${socket.id}`);
  });
});

await connectDb();
initializeAgentQueue();

server.listen(env.PORT, () => {
  console.log(`NxtBiz API listening on port ${env.PORT}`);
});

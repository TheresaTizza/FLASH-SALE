import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { QueueEvents } from "bullmq";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import orderRoutes from "./routes/orderRoutes.js";
import { orderQueue } from "./queues/orderQueue.js";
import redisConnection from "./config/redis.js";

// 1. Load configuration early to ensure all connections have credentials
dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});

const app = express();
const httpServer = createServer(app);

// 2. Socket.io setup: Essential for bridging the gap between workers and UI
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());
app.set("socketio", io);

// 3. Room Partitioning: Prevents "Broadcast Storms" by isolating users
io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  const userId = socket.handshake.query.userId;
  if (userId) {
    socket.join(userId);
    console.log(
      `👤 User [${userId}] connected to private notification channel.`,
    );
  }

  socket.on("disconnect", () => console.log("🔌 Client disconnected"));
});

// 4. The Bridge: Listen for BullMQ events to push real-time updates to the UI
const queueEvents = new QueueEvents("OrderQueue", {
  connection: redisConnection,
});

queueEvents.on("completed", async ({ jobId }) => {
  const job = await orderQueue.getJob(jobId);
  if (job && job.data.userId) {
    io.to(job.data.userId).emit("order_complete", { jobId, status: "success" });
  }
});

queueEvents.on("failed", async ({ jobId, failedReason }) => {
  const job = await orderQueue.getJob(jobId);
  if (job && job.data.userId) {
    io.to(job.data.userId).emit("order_failed", {
      jobId,
      reason: failedReason,
    });
  }
});

// 5. Infrastructure Init
await connectDB();

// 6. Graceful Shutdown: Ensures no "ghost" connections in Redis or Mongo
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 ${signal} received. Initiating graceful exit...`);

  httpServer.close(async (err) => {
    console.log("🚪 HTTP/WS server connections closed.");
    try {
      await Promise.all([mongoose.connection.close(), orderQueue.close()]);
      console.log("📦 Infrastructure connections drained.");
    } catch (error) {
      console.error("❌ Error during infrastructure drain:", error);
    }
    process.exit(0);
  });
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

app.use("/api/v1/orders", orderRoutes);

app.use((err, req, res, next) => {
  console.error(`❌ Root Error: ${err.stack}`);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === "production" ? "Server Error" : err.message,
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Sentinel Gatekeeper active on port ${PORT}`);
  console.log(
    `📡 Ingestion endpoint: POST http://localhost:${PORT}/api/v1/orders`,
  );
});

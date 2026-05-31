import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

/**
 * Redis Connection Configuration
 * Optimized for BullMQ high-concurrency processing
 */

const redisConfig = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,

  // Critical for BullMQ: Disable ioredis internal retry limit
  // so BullMQ can handle its own state transitions.
  maxRetriesPerRequest: null,

  // Reconnect strategy for production stability

  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};
const redisConnection = new Redis(redisConfig);

// Observability: Log connection status
redisConnection.on("connect", () =>
  console.log("✅ Redis Connected successfully"),
);
redisConnection.on("reconnecting", () =>
  console.warn("⚠️ Redis reconnecting..."),
);
redisConnection.on("error", (err) => console.error(`❌ Redis Error: ${err}`));

export default redisConnection;

import mongoose from "mongoose";
import dns from "node:dns";

// connect to MongoDB
const connectDB = async () => {
  // Force Node.js to use Cloudflare DNS (1.1.1.1) to resolve SRV records.
  // This bypasses local DNS issues that often cause "querySrv ECONNREFUSED".
  dns.setServers(["1.1.1.1"]);

  try {
    // 1. Pre-flight check
    if (!process.env.MONGO_URI) {
      console.error(
        "❌ Error: MONGO_URI is not defined in environment variables",
      );
      process.exit(1);
    }

    // 2. High Concurrency configuration
    const params = {
      maxPoolSize: 100, // Critical for handling high-concurrency spikes
      minPoolSize: 10, // Warm connections to avoid cold-start latency
      socketTimeoutMS: 30000,
      heartbeatFrequencyMS: 10000,
    };

    // 3. Establish connection
    const conn = await mongoose.connect(process.env.MONGO_URI, params);
    console.log(`📡 MongoDB Connected: ${conn.connection.host}`);

    // 4. Observability: Runtime health monitoring
    mongoose.connection.on("error", (err) =>
      console.error(`❌ DB Runtime Error: ${err}`),
    );
    mongoose.connection.on("disconnected", () =>
      console.warn("⚠️ DB Disconnected"),
    );
    mongoose.connection.on("reconnected", () =>
      console.log("✅ DB Reconnected"),
    );

    // 5. Query Debugging (Non-production)
    if (process.env.NODE_ENV !== "production") {
      mongoose.set("debug", true);
    }

    return conn;
  } catch (error) {
    if (
      error.message.includes("querySrv ETIMEOUT") ||
      error.message.includes("ECONNREFUSED")
    ) {
      console.error(
        "❌ Database Connection Error: Network/DNS issue detected.",
      );
      console.error(
        "💡 Hint: Check your Atlas IP Whitelist or try a non-SRV connection string.",
      );
    } else {
      console.error(`❌ Database Connection Error: ${error.message}`);
    }
    process.exit(1);
  }
};

export default connectDB;

import mongoose from "mongoose";

// connect to MongoDB
const connectDB = async () => {
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
    console.error(`❌ Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

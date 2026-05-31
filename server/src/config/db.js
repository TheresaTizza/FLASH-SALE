const mongoose = require("mongoose");

// connect to MongoDB

const connectDB = async () => {
  try {
    // pre flight check

    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI is not defined in the environment variables");
      process.exit(1);
    }

    // High Concurrency configuration
    const params = {
      maxPoolSize: 100,
      minPoolSize: 10,
      socketTimeoutMS: 30000,
      heartbeatFrequencyMS: 10000,
    };

    // lets create connection
    const connect = await mongoose.connect(process.env.MONGODB_URI, params);
    console.log(`📡 MongoDB Connected: ${conn.connection.host}`);

    // Health Check Monitoring
    mongoose.connection.on("error", (err) =>
      console.error(`❌ DB Runtime Error: ${err}`),
    );
    mongoose.connection.on("disconnected", () =>
      console.warn("⚠️ DB Disconnected"),
    );

    return connect;
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

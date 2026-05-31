🚀 Sprint 1 Implementation Guide: The Gatekeeper
🗄️ Persistence Layer: src/config/db.js
Objective: Configure a resilient connection pool to eliminate latency during high-traffic spikes.

✅ Requirements
Connection Pooling:

maxPoolSize = 100

minPoolSize = 10

Timeouts:

socketTimeoutMS = 30000

heartbeatFrequencyMS = 10000

Observability: Attach listeners to mongoose.connection for real-time health monitoring.

Query Debugging: Enable mongoose.set('debug', true) in non-production environments.

⚙️ Implementation Logic
Verify presence of MONGO_URI in environment variables.

Execute mongoose.connect() with pool + timeout options.

Attach listeners for error, disconnected, and reconnected events.

Conditionally enable debug mode based on process.env.NODE_ENV.

🚚 Transport Layer: src/config/redis.js & src/queues/orderQueue.js
Objective: Setup the high-speed message broker used to offload work from the API.

⚙️ Logic (redis.js)
Initialize Redis via ioredis.

Critical Setting: maxRetriesPerRequest = null (BullMQ requirement).

⚙️ Logic (orderQueue.js)
Import BullMQ Queue class.

Instantiate and export OrderQueue using shared Redis connection.

📥 Ingestion API: src/controllers/orderController.js
Objective: Create a sub-50ms endpoint that buffers orders without blocking on DB I/O.

⚙️ Implementation Logic
Extract userId and productId from request body.

Validate input → return 400 Bad Request if missing.

Generate unique jobId using uuidv4().

Insert job into orderQueue with payload:

userId, productId, jobId, timestamp.

Return HTTP 202 Accepted + jobId to client.

🎛️ Orchestration: src/server.js
Objective: Manage isolated user communication and handle system signals.

🔌 WebSockets & Rooms
On client connection → extract userId from socket.handshake.query.

Execute socket.join(userId) → private room for targeted notifications.

🛑 Graceful Shutdown
Bind listeners to SIGINT & SIGTERM.

Structured shutdown sequence:

Close HTTP server (stop incoming requests).

Await MongoDB connection pool closure.

Await BullMQ orderQueue Redis connection closure.

process.exit(0).
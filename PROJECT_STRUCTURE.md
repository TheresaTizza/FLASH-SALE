# 🏗️ FlashSale Sentinel: Project Architecture

This document defines the roles and responsibilities of the folders and files within the FlashSale Sentinel system, designed for high-concurrency event-driven processing.

## 📂 Root Directory

- **`client/`**: The React-based frontend application (Vite). Handles user interaction and real-time status updates via WebSockets.
- **`server/`**: The Node.js/Express backend environment. Contains all business logic, infrastructure configuration, and background processing.
- **`package.json` (Root)**: Acts as the project orchestrator. Uses `concurrently` to launch both the frontend and backend with a single command.

## 📂 Server Source (`server/src/`)

### 🛠️ `config/` (The Plumbing)

- **`db.js`**: Manages the MongoDB connection pool. Optimized with `maxPoolSize` to handle the "thundering herd" of orders.
- **`redis.js`**: Establishes the high-speed connection to Redis. Configured specifically for BullMQ with `maxRetriesPerRequest: null`.

### 🎮 `controllers/` (The Gatekeeper)

- **`orderController.js`**: The high-speed ingestion logic. Its primary function is to validate requests and push them to the Redis queue in sub-50ms, returning an `HTTP 202 Accepted` to the user.

### 🗃️ `models/` (The Data Schema)

- **`Product.js`**: Defines the inventory structure. Includes logic to ensure stock never drops below zero at the database level.
- **`Order.js`**: Defines the order record. Uses the `jobId` as a unique index to ensure **Idempotency** (preventing duplicate charges).

### 📮 `queues/` (The Producers)

- **`orderQueue.js`**: Defines the BullMQ "Waiting Room." This is where the API drops off order requests so the main server doesn't get bogged down by database processing.

### 🛣️ `routes/` (The Gateway)

- **`orderRoutes.js`**: Maps the URL endpoints (e.g., `POST /api/v1/orders`) to the correct controller functions.

### ⚙️ `workers/` (The Engine)

- **`orderWorker.js`**: The heavy lifter. This process runs independently of the API. It pulls jobs from Redis, starts MongoDB sessions (transactions), decrements stock atomically, and creates the final order record.

### 🚀 `server.js` (The Orchestrator)

- The main entry point for the backend. It integrates the Express API, the Socket.io server for real-time notifications, and the Graceful Shutdown logic to protect data integrity during restarts.

## 📂 Client Source (`client/src/`)

- **`socket.js`**: The WebSocket client configuration that allows the browser to maintain a persistent "phone line" to the server.
- **`App.jsx`**: The main dashboard. It handles the "Buy Now" logic, displays the queue status, and listens for the `order_complete` event from the server to show the final confirmation.

---

## 🔄 The Flow of an Order

1. **UI**: User clicks "Buy" in `App.jsx`.
2. **Ingestion**: `orderController.js` generates a `jobId` and puts it in the `orderQueue`.
3. **Acknowledgment**: User immediately sees "Queued" (No spinning loader).
4. **Processing**: `orderWorker.js` detects the job, checks MongoDB stock, and processes the transaction.
5. **Notification**: `server.js` detects the job is finished and pings the specific user via Socket.io.
6. **Completion**: `App.jsx` updates to "Order Confirmed! 🎉".

## 🛑 Graceful Shutdown

Implemented in `server.js`, this logic ensures that if the server is stopped, it first stops taking new orders, then finishes current database writes, and finally closes Redis connections to prevent data corruption.

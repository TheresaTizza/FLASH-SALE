# Technical Deep Dive: Sprint 1

## Ingestion Latency Targets
- **Target:** < 50ms per request.
- **Strategy:** Zero database IO during the request/response cycle. 
- **Bottleneck:** Redis network latency (~1-5ms).

## Infrastructure Details
### MongoDB Connection Pool
- **maxPoolSize (100):** Optimized for a t3.medium or equivalent cluster. Allows 100 concurrent operations per Node.js instance.
- **minPoolSize (10):** Ensures 10 "warm" connections are ready at the start of the sale to avoid cold-start latency.

### BullMQ Producer

## Real-time Strategy
### Socket.io Room Partitioning
To ensure security and performance:
1. Clients connect with a `userId` query parameter.
2. Server executes `socket.join(userId)`.
3. Notifications are sent via `io.to(userId).emit()`.
This prevents the server from broadcasting 10,000 "Order Confirmed" messages to everyone, which would crash the client-side event loop.

## HTTP Status Codes
- **400 Bad Request:** Initial validation failure (e.g., missing product ID).
- **202 Accepted:** Successful ingestion into the Redis Queue.
- **500 Internal Server Error:** Redis is down or unreachable.

## Security Considerations
- **CORS:** Restricted to `CLIENT_URL` to prevent cross-origin order spoofing.
- **Rate Limiting:** (Recommended for Sprint 3) To prevent bot-driven exhaustion of the BullMQ.

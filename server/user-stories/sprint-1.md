# Sprint 1: The Gatekeeper

**Goal:** Establish the infrastructure and create the high-speed ingestion endpoint.

## User Story 1.1: Core Infrastructure Setup
**As a** Developer,
**I want** to configure the MongoDB connection pool and Redis BullMQ producer,
**So that** the system can handle concurrent connections without crashing.
**Acceptance Criteria:**
- MongoDB connects with a `maxPoolSize` of 100.
- Redis connection is established via `ioredis`.
- BullMQ Queue `OrderQueue` is initialized.

## User Story 1.2: Asynchronous Order Ingestion
**As a** Customer,
**I want** to hit the "Buy" button and get an immediate confirmation that my request is being processed,
**So that** I don't see a spinning loader during a high-traffic sale.
**Acceptance Criteria:**
- POST `/api/v1/orders` validates basic input (User ID, Product ID).
- API generates a unique `jobId`.
- API pushes the job to BullMQ and returns `202 Accepted` with the `jobId`.
- No database write happens in this request cycle.
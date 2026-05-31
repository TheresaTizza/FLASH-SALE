# Sprint 2: The Engine

**Goal:** Implement the background worker and atomic inventory logic.

## User Story 2.1: Atomic Inventory Decrement
**As a** System,
**I want** to process orders one-by-one or in controlled concurrency,
**So that** we never sell more items than we have in stock (Overselling prevention).
**Acceptance Criteria:**
- Worker pulls a job from `OrderQueue`.
- Worker uses a MongoDB Transaction (session) to check stock.
- If stock > 0, decrement stock and create an Order record.
- If stock == 0, mark the order as failed.

## User Story 2.2: Idempotency Protection
**As a** System,
**I want** to ensure that a single "Buy" click doesn't result in two orders if the network glitched,
**So that** customer billing remains accurate.
**Acceptance Criteria:**
- Worker checks for an existing `idempotencyKey` before creating a new order.
- If key exists, return the existing order status instead of creating a new one.
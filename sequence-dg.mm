sequenceDiagram
    autonumber
    participant User as React Client
    participant API as Express API
    participant Broker as Redis / BullMQ
    participant Worker as Background Worker
    participant DB as MongoDB

    User->>API: POST /api/v1/orders (Place Order)
    Note over API: Basic Validation (Auth, Params)
    API->>Broker: Enqueue 'processOrder' job
    API-->>User: 202 Accepted (Job ID: 123)

    Note right of Broker: Job sits in queue until Worker is free

    Broker->>Worker: Pick up job (Job ID: 123)
    Worker->>DB: Check Stock & Create Order (Transaction)
    DB-->>Worker: Success
    
    Worker->>Broker: Publish 'order_complete' to Pub/Sub
    Broker->>API: Trigger WebSocket Event
    API->>User: WS Notification: "Order Confirmed"

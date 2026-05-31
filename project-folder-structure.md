FlashSale/
├── client/                # React Frontend (Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── App.jsx        # Main dashboard logic
│   │   └── socket.js      # WebSocket client configuration
│   └── package.json
├── server/                # Node.js Backend
│   ├── src/
│   │   ├── config/        # Infrastructure connections
│   │   │   ├── db.js      # MongoDB pooling & setup
│   │   │   └── redis.js   # Redis/ioredis configuration
│   │   ├── controllers/   # Request handling logic (Gatekeeper)
│   │   │   └── orderController.js
│   │   ├── models/        # Mongoose schemas
│   │   │   ├── Order.js
│   │   │   └── Product.js
│   │   ├── queues/        # BullMQ Producers (Task definitions)
│   │   │   └── orderQueue.js
│   │   ├── routes/        # API Endpoints
│   │   │   └── orderRoutes.js
│   │   ├── workers/       # BullMQ Consumers (The Engine)
│   │   │   └── orderWorker.js
│   │   └── server.js      # Main Express/Socket.io entry point
│   ├── .env               # Secrets and config
│   └── package.json
├── package.json           # Root orchestrator (runs both client & server)
└── .gitignore

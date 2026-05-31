import { Worker } from 'bullmq';
import mongoose from 'mongoose';
import redisConnection from '../config/redis.js';
import connectDB from '../config/db.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// 1. Initialize Database Connection
connectDB();

/**
 * Sprint 2: The Engine
 * Processes jobs from 'OrderQueue' with atomic inventory and idempotency
 */
const worker = new Worker('OrderQueue', async (job) => {
  const { userId, productId, jobId } = job.data;
  
  // Start a session for ACID compliance
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Logic 1: Idempotency Check (Story 2.2)
    // Ensures we don't process the same request twice
    const existingOrder = await Order.findOne({ jobId }).session(session);
    if (existingOrder) {
      console.log(`⚠️ Job ${jobId} already processed. Skipping...`);
      await session.commitTransaction();
      return { status: 'duplicate' };
    }

    // Logic 2: Atomic Stock Decrement (Story 2.1)
    // The filter 'stock: { $gt: 0 }' is the "Secret Sauce" for high-concurrency
    const product = await Product.findOneAndUpdate(
      { _id: productId, stock: { $gt: 0 } },
      { $inc: { stock: -1 } },
      { new: true, session }
    );

    if (!product) {
      throw new Error('OUT_OF_STOCK');
    }

    // Logic 3: Order Finalization
    await Order.create([{
      userId,
      productId,
      jobId,
      status: 'completed',
      processedAt: new Date()
    }], { session });

    await session.commitTransaction();
    console.log(`✅ Order Success: Job ${jobId} for User ${userId}`);
    
    return { status: 'success' };

  } catch (error) {
    // Rollback changes if anything goes wrong (e.g., Out of Stock)
    await session.abortTransaction();
    console.error(`❌ Order Failed: Job ${jobId} | Reason: ${error.message}`);
    
    // Optionally create a failed order record here for analytics
    throw error; 
  } finally {
    session.endSession();
  }
}, { 
  connection: redisConnection,
  concurrency: 5 // Process 5 orders in parallel per worker instance
});

worker.on('failed', (job, err) => {
  console.error(`🚨 Job ${job.id} moved to failed state: ${err.message}`);
});

console.log('⚙️ FlashSale Engine (Worker) is active and listening for orders...');

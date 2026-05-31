import { v4 as uuidv4 } from "uuid";
import { orderQueue } from "../queues/orderQueue.js";

export const createOrderIngestion = async (req, res, next) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const jobId = uuidv4();

    // 3. Push to BullMQ
    // We only wait for the job to be safely stored in Redis.
    // We do NOT wait for the worker to finish processing the order.

    await orderQueue.add(
      "ProcessOrder",
      { userId, productId, jobId, timestamp: new Date() },
      { jobId }, // This forces BullMQ to use our UUID as the job's primary key
    );

    // 4. Return 202 Accepted (The standard for high-performance async APIs)
    return res.status(202).json({
      success: true,
      message: "Order request received and queued.",
      jobId,
    });
  } catch (error) {
    next(error);
  }
};

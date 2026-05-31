import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    // This jobId must be unique to prevent duplicate processing (Idempotency)
    jobId: {
      type: String,
      required: true,
      unique: true,
    },
    failureReason: {
      type: String,
    },
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt fields
  },
);

orderSchema.index({ userId: 1 });

export default mongoose.model("Order", orderSchema);

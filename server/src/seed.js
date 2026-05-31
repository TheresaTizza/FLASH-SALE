import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Clear existing products
    await Product.deleteMany({});

    // Create a test product
    const product = await Product.create({
      name: "iPhone 15 Pro - Flash Sale",
      description: "Limited time offer!",
      price: 999,
      stock: 10, // Only 10 units available!
    });

    console.log(`✅ Database Seeded! Test Product ID: ${product._id}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

seedData();

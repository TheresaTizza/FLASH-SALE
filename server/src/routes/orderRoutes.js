import express from "express";
import { createOrderIngestion } from "../controllers/orderController.js";

const router = express.Router();

/**
 * Sprint 1.2: Order Ingestion Endpoint
 * This route is responsible for high-speed ingestion.
 * It maps the root of this router to the createOrderIngestion controller.
 */
router.post("/", createOrderIngestion);

export default router;

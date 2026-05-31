import {Queue} from "bullmq";
import redisConnection from "../config/redis.js";

export const orderQueue = new Queue("orderQueue", {connection: redisConnection});